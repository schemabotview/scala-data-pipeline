#!/usr/bin/env bash
# Install the course's pinned toolchain, as on a learner's machine: OpenJDK 25 and scala-cli 1.19.0,
# which fetches Scala 3.9.0 (the compiler, the library, the REPL) on first use.
# Usable as a cloud environment's setup script. Needs archive.ubuntu.com and repo1.maven.org:
# github.com is blocked in the cloud environment, so scala-cli's native launcher and coursier's
# `cs setup` are out. scala-cli's JVM launcher (org.virtuslab.scala-cli:cli_3) is on Maven Central:
# Maven resolves its 169 jars into $SCALA_CLI_HOME/lib, and /usr/local/bin/scala-cli runs it.
#
# The JDK pin is Ubuntu's CURRENT build: the archive keeps only the newest one, so java-bank's pin
# (25.0.4.1) can no longer be installed (2026-11-13). A newer build changes banners: re-pin here and
# in scripts/spine.py together, and re-run `npm run check:spine -- --write`.
set -euo pipefail
JDK_PKG=openjdk-25-jdk-headless
JDK_PIN=25.0.5.0.3+1-1~24.04.1
JDK_VERSION=25.0.5.0.3
JDK_HOME=/usr/lib/jvm/java-25-openjdk-amd64
SCALA_CLI=1.19.0
SCALA_CLI_HOME=/usr/local/scala-cli-$SCALA_CLI
MAVEN=3.9.16
TOOLS=(java javac javap jar)

have_jdk() {
  [[ "$("$JDK_HOME/bin/java" --version 2>/dev/null | head -1)" == "openjdk $JDK_VERSION "* ]] || return 1
  for t in "${TOOLS[@]}"; do [[ "$(readlink -f "$(command -v "$t")")" == "$JDK_HOME/bin/$t" ]] || return 1; done
}
have_cli() { [[ -f "$SCALA_CLI_HOME/lib/cli_3-$SCALA_CLI.jar" && "$(readlink -f /usr/local/bin/scala-cli)" == "$SCALA_CLI_HOME/bin/scala-cli" ]]; }

if ! have_jdk; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "$JDK_PKG=$JDK_PIN" >/dev/null
  for t in "${TOOLS[@]}"; do update-alternatives --set "$t" "$JDK_HOME/bin/$t" >/dev/null; done
fi

if ! have_cli; then
  work=$(mktemp -d)
  # Maven, only to resolve the launcher's classpath: the machine's own, or a sha-checked download.
  mvn=$(command -v mvn || true)
  if [[ -z "$mvn" ]]; then
    url=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$MAVEN/apache-maven-$MAVEN-bin.tar.gz
    curl -fsSL -o "$work/maven.tgz" "$url"
    echo "$(curl -fsSL "$url.sha512" | cut -d' ' -f1)  $work/maven.tgz" | sha512sum -c --quiet
    tar -xzf "$work/maven.tgz" -C "$work"
    mvn=$work/apache-maven-$MAVEN/bin/mvn
  fi
  cat > "$work/pom.xml" <<POM
<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion>
  <groupId>local</groupId><artifactId>scala-cli-launcher</artifactId><version>1</version><packaging>pom</packaging>
  <dependencies><dependency><groupId>org.virtuslab.scala-cli</groupId><artifactId>cli_3</artifactId><version>$SCALA_CLI</version></dependency></dependencies>
</project>
POM
  # The proxy drops a transfer now and then; Maven caches nothing for a failed one, so a retry resumes.
  for try in 1 2 3 4; do
    JAVA_HOME=$JDK_HOME "$mvn" -q -B -f "$work/pom.xml" -Dmaven.artifact.threads=2 \
      dependency:copy-dependencies -DoutputDirectory="$work/lib" >/dev/null 2>&1 && break
    [[ $try == 4 ]] && { echo "✗ could not resolve org.virtuslab.scala-cli:cli_3:$SCALA_CLI from Maven Central"; exit 1; }
    sleep $((try * 5))
  done
  rm -rf "$SCALA_CLI_HOME"
  mkdir -p "$SCALA_CLI_HOME/bin"
  mv "$work/lib" "$SCALA_CLI_HOME/lib"
  # The launcher. JAVA_TOOL_OPTIONS (a cloud proxy sets it) and SCALA_CLI_JVM_OPTS (where
  # scripts/spine.py puts it) are handed to THIS JVM as arguments, and JAVA_TOOL_OPTIONS is removed
  # from the environment, so coursier still downloads through the proxy while no JVM it
  # starts (Bloop, the compiler, our program) prints "Picked up JAVA_TOOL_OPTIONS" into a transcript.
  # The two flags silence JDK 25's warnings about the launcher's own libraries: a native launcher
  # (what a learner installs) prints neither.
  cat > "$SCALA_CLI_HOME/bin/scala-cli" <<'SH'
#!/usr/bin/env bash
home=$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)
read -r -a opts <<< "${JAVA_TOOL_OPTIONS:-} ${SCALA_CLI_JVM_OPTS:-}"
unset JAVA_TOOL_OPTIONS
exec "${JAVA_HOME:-/usr/lib/jvm/java-25-openjdk-amd64}/bin/java" \
  --sun-misc-unsafe-memory-access=allow --enable-native-access=ALL-UNNAMED \
  "${opts[@]}" -cp "$home/lib/*" scala.cli.ScalaCli "$@"
SH
  chmod +x "$SCALA_CLI_HOME/bin/scala-cli"
  ln -sf "$SCALA_CLI_HOME/bin/scala-cli" /usr/local/bin/scala-cli
  rm -rf "$work"
fi

have_jdk || { echo "✗ a tool does not resolve into $JDK_HOME"; exit 1; }
have_cli || { echo "✗ scala-cli $SCALA_CLI is not installed in $SCALA_CLI_HOME"; exit 1; }
echo "JDK $JDK_VERSION in $JDK_HOME and scala-cli $SCALA_CLI in $SCALA_CLI_HOME installed"
