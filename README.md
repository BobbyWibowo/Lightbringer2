# Lightbringer2

![Lightbringer2](https://s.fiery.me/nbI4.png)

Lightbringer2 is yet another [Discord](https://discordapp.com) self-bot written with [discord.js](https://discord.js.org/) (and [Discord Akairo](https://1computer1.gitbooks.io/akairo-tutorials/content/v/v8/) framework).

Lightbringer2 makes full use of ES2017's `async/await` functionality for clear, concise code that is simple to write and easy to comprehend.

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## Index

- [Requirements](#requirements)
- [Installing](#installing)
- [Updating](#updating)
- [Running](#running)
- [Getting your user-token](#getting-your-user-token)
- [Contact](#contact)
- [Credits](#credits)

### Requirements

- `git` ([Windows](https://git-scm.com/download/win) | [Linux](https://git-scm.com/download/linux) | [macOS](https://git-scm.com/download/mac))
- `node` ([Windows](https://nodejs.org/en/download/current/) | [Linux](https://nodejs.org/en/download/package-manager/) | [macOS](https://nodejs.org/en/download/current/))
- `yarn` ([Windows](https://yarnpkg.com/en/docs/install#windows-tab) | [Linux](https://yarnpkg.com/en/docs/install#linux-tab) | [macOS](https://yarnpkg.com/en/docs/install#mac-tab))

> This bot requires node `8.0.0` or newer (run `node -v` to check your node version).

### Installing

```bash
git clone https://github.com/BobbyWibowo/Lightbringer2.git
cd Lightbringer2
yarn install
```

Go to [Running](#running) section for more information about running the bot.

### Updating

```bash
cd path/to/Lightbringer2
git pull
yarn install --force
```

Make sure the bot is turned off before updating.

### Running

```bash
cd path/to/Lightbringer2
yarn start
```

If you want to use the bot with [PM2](http://pm2.keymetrics.io/), there is a shortcut called `yarn pm2`.

If you simply want to run the bot in background, you can try [screen](https://www.gnu.org/software/screen/), which is usually available by default in most Linux distros, with `yarn background`.

> **WARNING!** Make sure you have properly filled the configuration file before starting the bot in background or with PM2!
>
> Run the bot once with `yarn start` so that the bot can create the configuration template file!

### Getting your user-token

1. Hit `CTRL+SHIFT+I` (`CMD+ALT+I` on macOS) to bring up the Developers Console
2. If you can't see `Application` tab, at the top click on the arrow pointing to the right
3. Click `Application` tab
4. Go to `Local Storage` under the `Storage` section
5. Click on `https://discordapp.com`
6. At the bottom of the list, the last key should be `token`
7. Copy the value on the right side (omitting the quotes)

![Getting your user-token](https://s.fiery.me/ETRI.png)

## Contact

If you want to ask me anything, you will probably be able to get faster responses by contacting me directly on Discord.

My Discord is `Bobby#0001`. My DMs should be open to everyone.

## Credits

Icon made by [Freepik](http://www.freepik.com/) from [www.flaticon.com](http://www.flaticon.com/), with slight color modification.
