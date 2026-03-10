#!/usr/bin/env bun

/**
 * Template Initialization Script
 * Helps set up a new project from this template
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface TemplateConfig {
  projectName: string;
  authorName: string;
  authorEmail: string;
  githubRepo?: string;
}

function readPackageJson(): Record<string, unknown> {
  const packagePath = join(process.cwd(), 'package.json');
  if (!existsSync(packagePath)) {
    throw new Error('package.json not found');
  }
  const content = readFileSync(packagePath, 'utf-8');
  const parsed = JSON.parse(content);
  return parsed as Record<string, unknown>;
}

function updatePackageJson(config: TemplateConfig): void {
  const packagePath = join(process.cwd(), 'package.json');
  const packageJson = readPackageJson();

  packageJson.name = config.projectName.toLowerCase().replace(/\s+/g, '-');
  packageJson.version = '0.1.0';

  if (!packageJson.author) {
    packageJson.author = {
      name: config.authorName,
      email: config.authorEmail,
    };
  }

  writeFileSync(
    packagePath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8',
  );
}

function updateReadme(config: TemplateConfig): void {
  const readmePath = join(process.cwd(), 'README.md');
  if (!existsSync(readmePath)) {
    return;
  }

  let readme = readFileSync(readmePath, 'utf-8');
  readme = readme.replace(/^# .*/m, `# ${config.projectName}`);

  writeFileSync(readmePath, readme, 'utf-8');
}

function updateGitRemote(githubRepo: string): void {
  try {
    const result = Bun.spawnSync(['git', 'remote', 'remove', 'origin'], {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    // Ignore if origin doesn't exist
  } catch {
    // Continue anyway
  }

  try {
    Bun.spawnSync(['git', 'remote', 'add', 'origin', githubRepo]);
    console.log(`✅ Git remote set to: ${githubRepo}`);
  } catch (err) {
    console.warn(`⚠️  Could not set git remote: ${err}`);
  }
}

async function main(): Promise<void> {
  console.log('🚀 Mobile Template - Initialization\n');

  // Check dependencies first
  console.log('Checking dependencies...');
  try {
    Bun.spawnSync(['bun', 'run', 'check-deps'], {
      stdio: 'inherit',
    });
  } catch {
    console.log('⚠️  Some dependencies may be missing. Continuing anyway...\n');
  }

  // Get configuration from command line args or defaults
  const projectName = process.argv[2] || 'my-mobile-app';
  const authorName = process.argv[3] || 'Developer';
  const authorEmail = process.argv[4] || 'dev@example.com';
  const githubRepo = process.argv[5];

  const config: TemplateConfig = {
    projectName,
    authorName,
    authorEmail,
    githubRepo,
  };

  console.log('\n📝 Updating project files...');
  console.log(`   Project: ${config.projectName}`);
  console.log(`   Author: ${config.authorName} <${config.authorEmail}>`);
  if (config.githubRepo) {
    console.log(`   Repo: ${config.githubRepo}`);
  }

  updatePackageJson(config);
  console.log('   ✅ Updated package.json');

  updateReadme(config);
  console.log('   ✅ Updated README.md');

  if (config.githubRepo) {
    updateGitRemote(config.githubRepo);
  }

  console.log('\n✅ Template initialization complete!');
  console.log('\nNext steps:');
  console.log('1. Run: bun install');
  console.log('2. Run: bunx convex dev (to set up Convex)');
  console.log('3. Run: bun dev (to start development)');
  console.log('\n');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

