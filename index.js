// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { token } = require('./config.json');
const ytdl = require('ytdl-core-discord');
const { handleCommand } = require('./features/customCommands');
function Random(max,min) {
  var rnd = Math.floor(Math.random()*max)+min;
  return rnd;
}
const targetChannelId = '1197696655202463885'; // 記得替換成你的目標頻道ID
const targetChannelId1 = '1197652548866285638'; // 記得替換成你的目標頻道ID
const roleName = '一般人'; // 記得替換成你想要領取的身分組名稱
const audioPlayer = createAudioPlayer();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});


client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

 // 在指定的頻道中發送訊息
 const targetChannel = client.channels.cache.get(targetChannelId);
 if (targetChannel) {
   // 發送包含領取身分按鈕的消息
   const messageContent = `點擊下方按鈕以領取身分組: ${roleName}`;
   const components = [{
     type: 1,
     components: [{
       type: 2,
       style: 1,
       custom_id: 'joinButton',
       label: '領取身分',
     }],
   }];

   targetChannel.send({ content: messageContent, components })
     .catch(console.error);
 } else {
   console.error(`找不到目標頻道：${targetChannelId}`);
 }
});

client.on('interactionCreate', async (interaction) => {
 if (!interaction.isButton()) return;

 // 檢查按鈕的自訂ID
 if (interaction.customId === 'joinButton') {
   // 獲取用戶的成員對象
   const member = interaction.guild.members.cache.get(interaction.user.id);

   // 檢查身分組是否存在
   const role = interaction.guild.roles.cache.find((r) => r.name === roleName);
   if (!role) {
     return interaction.reply({ content: `找不到名為 "${roleName}" 的身分組！`, ephemeral: true });
   }

   // 將用戶加入身分組
   member.roles.add(role)
     .then(() => interaction.reply({ content: `成功領取身分組 "${role.name}"`, ephemeral: true }))
     .catch((error) => {
       console.error(error);
       interaction.reply({ content: '在領取身分組時發生錯誤！', ephemeral: true });
     });
 }
});


client.on('messageCreate', async (message) => {
  if (message.channel.id !== targetChannelId1) return; // 檢查是否在目標頻道
  if (message.author.bot || !message.content || typeof message.content !== 'string') return;
  const content = message.content.toLowerCase();
  const reply = (imagePaths) => {
    const rnd = Random(imagePaths.length, 1);
    message.reply({ files: [`./images/${imagePaths[rnd - 1]}.png`] });
  };

  const keywordMappings = {
    "幹三小": [3, 5, 6, 10, 16],
    "三小": [3, 5, 6, 10, 16],
    "蛤": [2],
    "幹": [1],
    "中指": [1],
    "工三小": [2],
    "小狗": [7, 13],
    "俗辣": [7, 13],
    "很氣": [8],
    "很急": [8],
    "滾啦": [15, 20],
    "超噁": [15, 20],
    "想打架": [18, 12],
    "輸贏": [18, 12],
    "聰明": [11]
  };

  for (const keywords in keywordMappings) {
    if (keywordMappings.hasOwnProperty(keywords) && content.includes(keywords.toLowerCase())) {
      reply(keywordMappings[keywords]);
      return;
    }
  }
});

client.on(Events.MessageCreate,async(message) => {
  if (message.channel.id !== targetChannelId1) return; // 檢查是否在目標頻道

  if (message.author.bot) return;

  if (message && message.content && typeof message.content === 'string'){

  const keywords = ['早安', '安安','早','安'];
  const content = message.content.toLowerCase();
  for (const keyword of keywords) {
  if (content.includes(keyword.toLowerCase())){
    var rnd = Random(3,1);
      switch(rnd){
        case 1:message.reply(`${message.author} 猴子是吧?`); break;
        case 2:message.reply(` ${message.author} 早上好中國`); break;
        case 3:message.reply(` ${message.author} 早你媽基八`); break;
      }
      return;
    }}}
    
});

client.on(Events.MessageCreate, async (message) => {
  if (message.channel.id !== targetChannelId1) return; // 檢查是否在目標頻道
  if (message.author.bot) return;

  if (message.content.startsWith('!')) {
    try {
      const replyMessage = await handleCommand(message);
      if (replyMessage) {
        message.reply(replyMessage);
      }
    }
    catch (err) {
      console.error(err);
      message.reply('發生錯誤，指令處理失敗。');
    }
  }
});

client.on(Events.MessageDelete, (message) => {
  if (message.channel.id !== targetChannelId1) return; // 檢查是否在目標頻道

  console.log(`${message.author.username}刪除了${message.content}`);
  message.channel.send('你是搞笑的吧??');
});

client.on(Events.MessageUpdate, (message) => {
  if (message.channel.id !== targetChannelId1) return; // 檢查是否在目標頻道
  console.log(message);
  console.log(
    `${message.author.username}更新了${message.content}改為${message.reactions.message.content}`,
  );
  message.reply('還敢偷改啊!冰鳥');
});


client.on('messageCreate', async (message) => {
  if (!message.guild) return;

  if (message.content.startsWith('!play')) {
      const voiceChannel = message.member.voice.channel;

      if (!voiceChannel) {
          return message.reply('請先進入一個語音頻道。');
      }

      const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      const url = message.content.slice('!play'.length).trim(); // 取得 !play 之後的所有內容

      try {
          const stream = await ytdl(url);
          const resource = createAudioResource(stream);

          audioPlayer.play(resource);
          connection.subscribe(audioPlayer);

          message.reply('開始播放音樂！');
      } catch (error) {
          console.error('播放音樂時發生錯誤:', error);
          message.reply('播放音樂時發生錯誤。請確保提供正確的音樂網址。');
      }
  }

  if (message.content.startsWith('!stop')) {
      const voiceConnection = getVoiceConnection(message.guild.id);
      if (voiceConnection) {
          voiceConnection.destroy();
          message.reply('停止播放音樂。');
      }
  }
});

// Log in to Discord with your client's token
client.login(token);
