const semver = require('semver')
const getTagFor = require('get-github-tag')
const download = require('download')

const extract = require('extract-zip')

const chalk = require('chalk')

const fs = require('fs')

const ncp = require('ncp').ncp
ncp.limit = 16

const getUpdate = (appRoot) => {
    let currentVersion
    try {
        currentVersion = require(appRoot + '/metronami/package.json').version || '0.0.0'
    } catch (e) {
        currentVersion = '0.0.0'
    }
    
    return new Promise((resolve) => {
        getTagFor('hiyamashu', 'Metronami', '').then(async (tag) => {
            const tagCleaned = semver.clean(tag)
            if (semver.lt(currentVersion, tagCleaned) === false) {
                // console.log(chalk.white('You are running the latest version of Metronami.'))
                return resolve(false)
            }

            // Url of the package
            const file = `https://github.com/hiyamashu/Metronami/archive/refs/tags/${tag}.zip`
            const filePath = appRoot + '/update'

            await download(file, filePath)
                .then(() => {
                    console.log(chalk.whiteBright(`Package downloaded: ${tag}`))
                })

            return resolve(tag)
        })
    })
}

const applyUpdate = (appRoot, tag) => {
    return new Promise((resolve) => {
        // Copy save data
        ncp(appRoot + '/metronami/data', appRoot + '/update/ptn_backup', (err) => {
            // Delete the old files
            fs.rmdir(appRoot + '/metronami', { recursive: true }, () => {
                const fileName = `Metronami-${tag.substring(1)}`
                // Unzip the file
                extract(appRoot + `/update/${fileName}.zip`, { dir: appRoot.path })

                // Rename directory
                setTimeout(() => {
                    fs.rename(appRoot + `/${fileName}`, appRoot + '/metronami', () => {
                        // Copy save files back
                        ncp(appRoot + '/update/ptn_backup', appRoot + '/metronami/data', (err) => {
                            return resolve()
                        })
                    })
                }, 3000)
            })
        })
    })
}

module.exports = {
    getUpdate,
    applyUpdate
}
