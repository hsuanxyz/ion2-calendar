# Contributing

Thanks for your interest in contributing

## Creating a Pull Request

### Setup

1. Fork it!
2. Create your feature branch: git checkout -b my-new-feature
3. Run `npm i` in root and `dev/` folder
4. Commit your changes: git commit -am 'Add some feature'
5. Push to the branch: git push origin my-new-feature
6. Submit a pull request :D

### Modifying Components

1. Run `npm start`
2. Create or modify in the `dev/src/ion2-calendar/`

### Adding Demos

1. Run `npm i` in `demo/` folder
2. Run `npm run demo:serve`
2. Create or modify the demo in the `demo/` folder.


## Commit Message Format

`type(scope): subject`

### Type

Must be one of the following:

- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- demo: Demos only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- do not capitalize first letter
- do not place a period . at the end
- entire length of the commit message must not go over 50 characters
- describe what the commit does, not what issue it relates to or fixes
- be brief, yet descriptive - we should have a good understanding of what the commit does by reading the subject
