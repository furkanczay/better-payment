module.exports = {
  types: [
    { type: 'feat', section: '✨ Features' },
    { type: 'fix', section: '🐛 Bug Fixes' },
    { type: 'perf', section: '⚡ Performance Improvements' },
    { type: 'revert', section: '⏪ Reverts' },
    { type: 'docs', section: '📚 Documentation' },
    { type: 'style', section: '💎 Styles', hidden: true },
    { type: 'chore', section: '🔧 Miscellaneous Chores', hidden: true },
    { type: 'refactor', section: '♻️ Code Refactoring' },
    { type: 'test', section: '✅ Tests', hidden: true },
    { type: 'build', section: '📦 Build System', hidden: true },
    { type: 'ci', section: '👷 CI', hidden: true },
  ],
  skip: {
    bump: false,
    changelog: false,
    commit: false,
    tag: false,
  },
  bumpFiles: [
    {
      filename: 'package.json',
      type: 'json',
    },
  ],
  releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
};
