var player = require('play-sound')(opts = {})
var play = function () {
          var files = require('/usr/local/lib/node_modules/drumpf/lib/sounds.json')
          var file = files[Math.floor(Math.random() * files.length - 1)]
          player.play("/usr/local/lib/node_modules/drumpf/lib/sounds/" + file, function (err) {
                    if(err) throw err
          })
}
exports.play = play
