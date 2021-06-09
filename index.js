const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config.js')
const bot = new Discord.Client()

const loadData = function (callback) {
    fs.readFile('database.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        try {
            const database = JSON.parse(data);
            if (callback) {
                callback(database);
            }
        } catch (err) {
            console.error(err)
        }
    });
}

const start = function (database) {
    bot.login(config.apiKey)

    bot.on('ready', function () {
        console.log('Kwikwi is ready');
        bot.user.setActivity(config.activity).catch(console.error);
    });

    bot.on('message', function (message) {
        if (message.author.bot === true) {
            return;
        }

        const authorId = message.author.username + '#' + message.author.discriminator;
        if (config.admins.includes(authorId)) {
            const help = '/kwikwi help'
            if (message.content.startsWith(help)) {
                helpCmd(message);
                return;
            }

            const addEmojiCmd = '/kwikwi addEmoji';
            if (message.content.startsWith(addEmojiCmd)) {
                addEmoji(message, message.content.substr(addEmojiCmd.length), database);
                return;
            }

            const addCmd = '/kwikwi add';
            if (message.content.startsWith(addCmd)) {
                addMessage(message, message.content.substr(addCmd.length), database);
                return;
            }
        } else if (message.content.startsWith('/kwikwi')) {
            message.reply('ta ta ta ta, tu fais quoi ?');
            return;
        }

        if ((message.content.toLowerCase().includes('kwikwi'))) {
            reply(message, database);
        }
    });
}

const reply = function (message, replies) {
    const author = message.author;

    console.log('')
    console.log(author.username + ' : ' + message.content)
    const authorId = author.username + '#' + author.discriminator;
    const authorData = replies[authorId] || replies.defaults

    const authorReplies = authorData.filter(function (item) {
        return message.content.toLowerCase().includes(item.contains || '')
    }).pop();

    const replyMessages = authorReplies.messages;
    const replyEmojis = authorReplies.emojis;

    const replyMessage = replyMessages[Math.floor(Math.random() * replyMessages.length)];
    message.reply(replyMessage).then(() => console.log(replyMessage)).catch(console.error);

    let emojis = replyEmojis;
    if (replyEmojis.length === 0) {
        return;
    }
    for (let i = 0; i < (authorReplies.countEmojis || 1); i++ ) {
        const index = Math.floor(Math.random() * emojis.length);
        const emoji = emojis[index];
        emojis = emojis.filter(function (current, j) {
            return j !== index;
        })
        message.react(emoji).then(() => console.log(emoji)).catch(console.error)
    }
}

const addMessage = function (message, args, database) {
    const cmd =  args.split('|').map(item => item.trim());
    if (cmd.length < 2) {
        message.reply('Commande invalide.');
        return;
    }
    const userData = database[cmd[0]] || [];
    if (cmd.length === 3) {
        const contains = cmd[1];
        const replies = userData.filter((item) => {
            return contains === item.contains
        }).pop() || { contains: contains, messages: [], emojis: [] };
        replies.messages.push(cmd[2]);
        database[cmd[0]] = [ ...userData.filter((item) => {
            return contains !== item.contains
        }), replies ];
    } else {
        const replies = userData.filter((item) => {
            return '' === (item.contains || '')
        }).pop() || { messages: [], emojis: [] };
        replies.messages.push(cmd[1]);
        database[cmd[0]] = [replies , ...userData.filter((item) => {
            return '' !== (item.contains || '')
        })]
    }
    console.log('Nouveau message pour '+cmd[0]+' bien ajouté.');
    message.reply('Nouveau message pour '+cmd[0]+' bien ajouté.');
    const data = JSON.stringify(database);
    fs.writeFileSync('database.json', data);
}

const addEmoji = function (message, args, database) {
    const cmd =  args.split('|').map(item => item.trim());
    if (cmd.length < 2) {
        message.reply('Commande invalide.');
        return;
    }
    const userData = database[cmd[0]] || {};
    if (cmd.length === 3) {
        const contains = cmd[1];
        const replies = userData.filter((item) => {
            return contains === item.contains
        }).pop() || { contains: contains, messages: [], emojis: [] };
        replies.emojis.push(cmd[2]);
        database[cmd[0]] = [ ...userData.filter((item) => {
            return contains !== item.contains
        }), replies ];
    } else {
        const replies = userData.filter((item) => {
            return '' === (item.contains || '')
        }).pop() || { messages: [], emojis: [] };
        replies.emojis.push(cmd[1]);
        database[cmd[0]] = [replies , ...userData.filter((item) => {
            return '' !== (item.contains || '')
        })]
    }
    console.log('Nouvel emote pour '+cmd[0]+' bien ajouté.');
    message.reply('Nouvel emote pour '+cmd[0]+' bien ajouté.');
    const data = JSON.stringify(database);
    fs.writeFileSync('database.json', data);
}

const helpCmd = function (message) {
    message.reply(`Hello! si tu veux faire mumuse on peut ajouter des phrases et des emotes sur kwikwi
    
/kwikwi add jeff#4608|Salut jeff !
(ajout d’un message pour jeff par défaut)

/kwikwi add jeff#4608|salut|Salut jeff ! tu vas bien ?
(ajout d’un message pour jeff si le message contient salut : genre "Salut kwikwi")

/kwikwi addEmoji  jeff#4608|:point_right:
(même principe avec un emot)

/kwikwi addEmoji jeff#4608|salut|:wave:
(idem pour les messages qui contiennent "salut")

et pour ajouter des messages "globaux" (pour les autres du coup) tu mets juste "defaults" à la place de "jeff#4608"
/kwikwi add defaults|salut|salut !:
/kwikwi addEmoji defaults|salut|:wave:

tout est sauvé, donc si ca plante et que je redémarre c’est persisté.

`);
}

loadData(start)

