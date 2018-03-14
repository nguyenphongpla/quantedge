var express = require('express')
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));
app.use('/libs', express.static(__dirname + '/node_modules'));

http.listen(3333, ()=>{
    console.log('running on 3333');
})
var csv = require('csvtojson'),
    csv_file = 'data.csv',
    stock_data = [],
    stock_origin = [];
csv()
    .fromFile(csv_file)
    .on('json', (data)=>{
        data.Price = parseFloat(data.Price);
        data.Volume = parseInt(data.Volume);
        stock_data.push(data);
        stock_origin.push(data);
    })
    .on('done', ()=>{
        setInterval(()=>{
            autoPrice(stock_data);
            stock_data.sort((a,b)=>{
                return b.Volume-a.Volume;
            });
            var gainers = stock_data.slice(0,21),
                loosers = stock_data.slice(11,31).reverse();
            io.sockets.emit('top_gainers', gainers);
            io.sockets.emit('top_loosers', loosers);
        }, 5000);        
    });

function autoPrice(data){
    data.forEach(item => {
        let temp_percent = getRandomArbitrary(-0.05, 0.05),
            temp_volume = getRandomInt(10,30);
        item.PriceChange = Math.round((item.Price + item.Price * temp_percent) * 100) / 100;
        item.Volume = item.Volume + temp_volume;
    });
}

function getRandomArbitrary(min, max){
    return Math.random() * (max-min)+min;
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
