<p align="center">
<img align="center" title="Lightbringer2" src="https://s.fiery.me/4bTgz5icwUq99CoMhDn3ET0VX2I7svEh.png">
</p>

<p align="center">
<b>Lightbringer2</b> is yet another <a href="https://discordapp.com">Discord</a> self-bot written with <a href="https://discord.js.org/">discord.js</a> (and <a href="https://1computer1.gitbooks.io/akairo-tutorials/content/v/v8/">Discord Akairo</a> framework).
</p>

<p align="center">
<a href="https://github.com/feross/standard"><img align="center" title="JavaScript Style Guide" src="https://cdn.rawgit.com/feross/standard/master/badge.svg"></a>
</p>

# Lightbringer2
Lightbringer2 makes full use of ES2017's `async/await` functionality for clear, concise code that is simple to write and easy to comprehend.

## Index
- [In Development](#in-development)
- [Requirements](#requirements)
- [Installing](#installing)
- [Updating](#updating)
- [Running](#running)
- [Getting your user-token](#getting-your-user-token)
- [Contact](#contact)
- [Credits](#credits)

### In Development
Just a heads up, this 2nd generation is still in development!  
It works pretty well as it is, but it does not have as many features/commands as the 1st generation.  
I have stopped using the 1st generation for over a month though, since despite of the fact that this one does not have as many features/commands, it already has most of the ones that I used often (such as Last.fm status updater, dictionary, and some others).  
Commands list and gallery will come at a later date. Unfortunately though, they have a pretty low priority on my to-do list.

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
yarn install
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
> Run the bot once with `yarn start` so that the bot can create the configuration template file!

### Getting your user-token
1. Hit `CTRL+SHIFT+I` (`CMD+ALT+I` on macOS) to bring up the Developers Console
> If you already see the `Application` tab, you can skip step 2
2. At the top, click on the arrow pointing to the right
3. Click `Application`
4. Go to `Local Storage` under the `Storage` section
5. Click on `https://discordapp.com`
6. At the bottom of the list, the last key should be `token`
7. Copy the value on the right side (omitting the quotes)

![Getting your user-token](https://s.fiery.me/nqBMpuRzVCh5C3Sv5RPO48ezVvqKBOOO.png)

## Contact
If you want to ask me anything, you will probably be able to get faster responses by contacting me directly on Discord.  
My Discord is `Bobby#0001`. My DMs should be open to everyone.

## Credits
Icon made by [Freepik](http://www.freepik.com/) from [www.flaticon.com](http://www.flaticon.com/), with slight color modification.
