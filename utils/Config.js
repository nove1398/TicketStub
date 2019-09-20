module.exports = {
    jwtSecret: function () {
        return "Azp";
    },
    stripeKey: () => {
        return "sk_test"
    }, 
    mailData: () => {
        return {
            pass: 'pass',
            user: 'uname',
            host: 'smtp.ipage.com'
        };
    }
}
