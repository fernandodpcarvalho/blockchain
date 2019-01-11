const be = require('blockexplorer')

function getBlock(index) {
    //Add your code here
    // Start by requesting the hash
    // Then request the block and use console.log
    be.blockIndex(index)
      .then((result) => {
          console.log(result);
          var resultJson = JSON.parse(result);
          getBlockInfoByHash(resultJson.blockHash);
      })
      .catch((err) => {
          throw err
      })
}

function getBlockInfoByHash(hash) {
    be.block(hash)
      .then(result => console.log(result))
      .catch(err => {
          throw err
      })
}

(function theLoop (i) {
    setTimeout(function () {
        getBlock(i);
        i++;
        if (i < 3) theLoop(i);
    }, 3600);
  })(0);
