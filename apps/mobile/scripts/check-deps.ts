#!/usr/bin/env bun

/**
 * Dependency Checker Script
 * Checks for required tools and dependencies before starting development
 */

interface Dependency {
  name: string;
  command: string;
  installUrl?: string;
  installCommand?: string;
  required: boolean;
  description: string;
}

const dependencies: Dependency[] = [
  {
    name: 'Node.js',
    command: 'node --version',
    installUrl: 'https://nodejs.org',
    installCommand: 'Download from nodejs.org',
    required: true,
    description: 'JavaScript runtime (LTS version recommended)',
  },
  {
    name: 'Bun',
    command: 'bun --version',
    installUrl: 'https://bun.sh',
    installCommand: 'npm install -g bun',
    required: true,
    description: 'Fast JavaScript runtime and package manager',
  },
  {
    name: 'Git',
    command: 'git --version',
    installUrl: 'https://git-scm.com',
    installCommand: 'Download from git-scm.com',
    required: true,
    description: 'Version control system',
  },
  {
    name: 'Expo CLI',
    command: 'npx expo --version',
    installUrl: 'https://docs.expo.dev',
    installCommand: 'npm install -g expo-cli',
    required: false,
    description: 'Expo development tools (optional, can use npx)',
  },
];

interface CheckResult {
  dependency: Dependency;
  installed: boolean;
  version?: string;
  error?: string;
}

async function checkDependency(dep: Dependency): Promise<CheckResult> {
  try {
    // Simplify: just try to run the command directly without shell
    const cmdParts = dep.command.split(' ');
    const proc = Bun.spawnSync(cmdParts, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (proc.exitCode === 0) {
      const output = proc.stdout ? new TextDecoder().decode(proc.stdout) : '';
      const version = output.trim().split('\n')[0];
      return {
        dependency: dep,
        installed: true,
        version,
      };
    }

    return {
      dependency: dep,
      installed: false,
      error: 'Command failed',
    };
  } catch (err) {
    return {
      dependency: dep,
      installed: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

function printResults(results: CheckResult[]): void {
  console.log('\n🔍 Dependency Check Results\n');
  console.log('═'.repeat(60));

  const requiredMissing: CheckResult[] = [];
  const optionalMissing: CheckResult[] = [];

  for (const result of results) {
    const { dependency, installed, version, error } = result;
    const icon = installed ? '✅' : '❌';
    const status = installed ? `Installed (${version})` : 'Not installed';

    console.log(`\n${icon} ${dependency.name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Description: ${dependency.description}`);

    if (!installed) {
      if (dependency.required) {
        requiredMissing.push(result);
        console.log(`   ⚠️  REQUIRED - Must be installed`);
      } else {
        optionalMissing.push(result);
        console.log(`   ℹ️  Optional`);
      }

      if (dependency.installUrl) {
        console.log(`   📥 Install: ${dependency.installUrl}`);
      }
      if (dependency.installCommand) {
        console.log(`   💻 Command: ${dependency.installCommand}`);
      }
      if (error) {
        console.log(`   🔴 Error: ${error}`);
      }
    }
  }

  console.log('\n' + '═'.repeat(60));

  if (requiredMissing.length > 0) {
    console.log('\n❌ Missing Required Dependencies:');
    for (const result of requiredMissing) {
      console.log(`   - ${result.dependency.name}`);
      if (result.dependency.installCommand) {
        console.log(`     Run: ${result.dependency.installCommand}`);
      }
    }
    console.log('\n⚠️  Please install the required dependencies before continuing.');
    process.exit(1);
  } else if (optionalMissing.length > 0) {
    console.log('\n✅ All required dependencies are installed!');
    console.log('\nℹ️  Optional dependencies missing (not critical):');
    for (const result of optionalMissing) {
      console.log(`   - ${result.dependency.name}`);
    }
  } else {
    console.log('\n✅ All dependencies are installed!');
  }

  console.log('');
}

async function main(): Promise<void> {
  console.log('🚀 Mobile Template - Dependency Checker\n');

  const results = await Promise.all(
    dependencies.map((dep) => checkDependency(dep)),
  );

  printResults(results);
}

main().catch((err) => {
  console.error('Error running dependency check:', err);
  process.exit(1);
});

