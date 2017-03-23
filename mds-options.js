// Default options for [MDS](https://github.com/sidiandi/mds)

module.exports = {
    // The port to be used by the web server
    // port: 3000,

    // Directory with the content (Markdown files)
    contentDirectory: '.',

    // opens the wiki in the local web browser on start
    openInBrowser: true,

    // [NodeMailer](https://nodemailer.com/about/) configuration. Uncomment if MDS should sent change notifications by mail.
    /*
    mailer: {
        service: 'Gmail',
        auth: {
            user: 'your.name@gmail.com',
            pass: 'your google app password'
        },
        tls: { rejectUnauthorized: false }
    }
    */
}



