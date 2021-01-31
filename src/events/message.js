module.exports = async (client, message) => {
  if (message.author.bot) return 

  if (!message.content.startsWith(client.config.prefix)) return

  const command = message.content.split(' ')[0].slice(client.config.prefix.length)
  const args = message.content.split(' ').slice(1)
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))
  if (!cmd || command === '') return
  if (!message.guild && cmd.conf.guildOnly) return client.embed.send(message, { desc: 'This command is unavailable via private messages. Please run this command in a guild.' })

  if (client.config.botMaintenance && message.author.id !== client.config.ownerID) return client.embed.send(message, { desc: 'The bot can currently only be run by the bot owner. Sorry for the inconvience.' })

  client.permLevel(client, message).then(permLevel => {
    if (permLevel >= client.levelCache[cmd.conf.permLevel]) {
      const guildName = message.guild.name.replace(/[^1-90a-zA-Z ]/g, '').trim()
      client.logger.cmd(`${guildName}: ${message.author.tag}: '${message.content}'`)
      cmd.run(client, message, args)
    } else {
      client.embed.send(message, {
        code: true,
        desc: 'You do not have permission to run this command.',
        fields: [
          {
            name: 'Have',
            value: client.config.permLevels.find(l => l.level === permLevel).name
          },
          {
            name: 'Required',
            value: cmd.conf.permLevel
          }
        ]
      })
    }
  }).catch((e) => {
    if (message.guild) {
      client.embed.debug(message, `Tell ${message.guild.owner.tag} to assign a role for ${client.config.permLevels.find(l => l.level === e).name} in the settings.`)
    }
  })
}
