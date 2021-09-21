module.exports = async (appRoot) => {
    const execa = require('execa')
    const chalk = require('chalk')
    const open = require('open')
    const { getUpdate, applyUpdate } = require('./updater')

    // Get current version number from Metronami package
    let currentVersion
    try {
        currentVersion = require(appRoot + '/metronami/package.json').version
    } catch (e) {
        currentVersion = '0.0.0'
    }

    // Launch Browser flag
    let launchBrowser = true;
    let TimeToLaunch = 8000

    // Installation Mode
    // Will activate if currentVersion is 0.0.0
    if (currentVersion === '0.0.0') {
        console.log(chalk.whiteBright('[LOADER] New installation detected.'))
        console.log(chalk.green('Please wait as we download additional files...'))

        await getUpdate(appRoot).then(async (latestTag) => {
            await applyUpdate(appRoot, latestTag)
            console.log(chalk.green(`[LOADER] Metronami ${latestTag} has been installed.`))

            // Set TimeToLaunch longer to accomodate installation time
            TimeToLaunch = 20000
        })
    }

        while (true) {
            try {
                // Start the browser if flag is set
                if (launchBrowser === true) {
                    launchBrowser = false
                    setTimeout(() => {
                        console.log(`${chalk.blue('Launching Metronami in your browser:')} ${chalk.whiteBright('If the page does not load, give it awhile and refresh the page.')}`)

                        // Open the browser
                        open(`http://localhost:36554`)

                        // After a delay, show a message to the user
                        setTimeout(() => {
                            console.log(`${chalk.cyan('Nothing happened? ')}${chalk.whiteBright(`Type http://localhost:36554 in your web browser's address bar to access Metronami.`)}`)
                        }, 5000)
                    }, TimeToLaunch)
                }

                // Execute the start command for Metronami
                const { stdout } = await execa('npm run app-start', { stdio: 'inherit' })
            } catch (exitData) {
                if (exitData.exitCode === 0) {
                    process.exit()
                }

                // 200 = Restart signal
                if (exitData.exitCode === 200) {
                    console.log(chalk.white('[LOADER] Restart signal received. Restarting...'))
                    continue
                }

                // 201 - Update mode
                if (exitData.exitCode === 201) {
                    console.log(chalk.white('[LOADER] Entering Update mode'))
                    console.log(chalk.redBright('While Metronami is updating, do not interrupt or disturb this process.'))

                    const getCurrentVersion = await getUpdate(appRoot)
                    await applyUpdate(appRoot, getCurrentVersion)

                    console.log(chalk.green('[LOADER] Update complete. Restarting...'))
                    
                    continue
                }

                // If everything else, throw the error
                throw exitData
            }
        }
}