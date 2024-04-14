const { cLog } = require("../components/functions/cLog");

const formLink = "https://forms.gle/WrzohsKpa2nqTk1M8"

module.exports = {
    name: "verifyUser",
    once: false,
    async execute(interaction, server) {
        const email = interaction.fields.getTextInputValue("email")
        cLog(["Attempting to verify  : ", interaction.user.username, email],{ guild: interaction.guild, subProcess: "VerifyUser" });
        const [userExists, error] = await verifyUserOnWebsite(email)
        if (error) return

        cLog(["Attempting to verify  : ", userExists],{ guild: interaction.guild, subProcess: "VerifyUser" });
        if (!userExists) {
            await interaction.reply({content:`We could not find this account. Please make sure you have entered the correct email.\n\n# Believe this is a mistake?\n- [Submit Verification Request Here](${formLink})\n\nPlease be aware that it may take a few days to confirm your member status on Discord and we apologize for any delays and inconvenience.\n\nAdditionally, confirmations will not be accepted for YouTube screenshots. Screenshots will need to be unedited from your account page and include your email.\n\nPlease make sure your **DISCORD USERNAME IS CORRECT**, otherwise we will be unable to give you access or respond to your form.\n\n*Example screenshot, email hidden for privacy purposes. Screenshots **will need** to include your email to be verified.*`, files: ["./extra/images/verify_example.png"], ephemeral:true})
            return
        } 
        
        cLog(["Attempting to give user premium  : ", interaction.user.username],{ guild: interaction.guild, subProcess: "VerifyUser" });
        await grantUserPremium(interaction)
    },
};




/* {
    "success": true,
    "data": {
        "emailExistsFirebase": true,
        "emailExistsMongo": false,
        "userImported": false
    },
    "errorMsgUser": null
} */

async function verifyUserOnWebsite(email) {
    let response = await fetch("https://www.skill-capped.com/api/user/importaccount", {
        method:"POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email
        })
    })
    response = await response.json()
    console.log("response : ", response)
    if (!response.success) { // This is if website handled request. Returns success even if no user found
        cLog(["Website did not respond  : ", interaction.user.name ],{ guild: interaction.guild, subProcess: "VerifyUser" });
        await interaction.reply({content: "Something went wrong handling your request. Please let Staff know about this error!", ephemeral: true})
        return [null, true]
    }
    if(response.data.emailExistsFirebase) return [true, null]
    return [false, null]
    
}
const roleId = "1084871847549620285"
async function grantUserPremium(interaction) {
    const role = await interaction.guild.roles.fetch(roleId)
    cLog(["Found role  : ", role.name],{ guild: interaction.guild, subProcess: "VerifyUser" });
    
    await interaction.member.roles.add(role)
    await interaction.reply({content:"Your account has been succesfully linked!\nCheck out <channel> for more information about your new premium access", ephemeral: true })
    cLog(["User granted premium  : ", interaction.user.username],{ guild: interaction.guild, subProcess: "VerifyUser" });
}
