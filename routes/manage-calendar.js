var express = require('express');
var router = express.Router();
var debug = require('debug')('covidoccupancymanager:cal');
var fs = require('fs');
var createError = require('http-errors');

var database = JSON.parse(fs.readFileSync('./database/db.json'));
var savetoDb = function() {
    fs.writeFileSync('./database/db.json', JSON.stringify(database));
}

setInterval(savetoDb, 10000);

var MAX_OCCUPANCY = Number.parseInt(process.env.MAX_OCCUPANCY) || 10
//Object.observe(database, savetoDb);

router.get('/ip', function(req, res, next) {
    const userIp = req.header('x-forwarded-for') ||  req.connection.remoteAddress;
    res.json({userIp});
})
/* GET users listing. */
router.get('/:date(\\d{4}-\\d{2}-\\d{2})', function(req, res, next) {
    const date = req.params.date;
    debug('getting date %s', date);
    if(!database[date]) {
        database[date] = {
            large: {
                '6': [],
                '7': [],
                '8': [],
                '9': [],
                '10': [],
                '11': [],
                '12': [],
                '13': [],
                '14': [],
                '15': [],
                '16': [],
                '17': [],
                '18': [],
                '19': [],
                '20': []
            }, small: {
                '6': [],
                '7': [],
                '8': [],
                '9': [],
                '10': [],
                '11': [],
                '12': [],
                '13': [],
                '14': [],
                '15': [],
                '16': [],
                '17': [],
                '18': [],
                '19': [],
                '20': []
            }
        }
    }

    const userIp = req.header('x-forwarded-for') ||  req.connection.remoteAddress;
    const clone = JSON.parse(JSON.stringify(database[date]));
    Object.keys(clone.large).forEach(k => {
        clone.large[k].forEach(t => {
            t.canManage = userIp === t.ip
            t.ip = undefined;
        })
    })
    Object.keys(clone.small).forEach(k => {
        clone.small[k].forEach(t => {
            t.canManage = userIp === t.ip
            t.ip = undefined;
        })
    })

    res.json(clone);
});

function haveResForDate(date, ip) {
    let hasMapping = false;
    Object.keys(date.large).forEach(k => {
        date.large[k].forEach(t => {
            hasMapping = hasMapping || ip === t.ip
        });
    });
    Object.keys(date.small).forEach(k => {
        date.small[k].forEach(t => {
            hasMapping = hasMapping || ip === t.ip
        });
    });
    return hasMapping;
}

router.post('/:side(small|large)/:date(\\d{4}-\\d{2}-\\d{2})/:hour(\\d{1,2})', function (req, res, next) {
    const reqBody = req.body;
    const side = req.params.side;
    const date = req.params.date;
    const time = req.params.hour;
    const userIp = req.header('x-forwarded-for') ||  req.connection.remoteAddress;

    reqBody.ip = userIp;
    debug('%s is requesting to visit on %s at %s', reqBody.name, date, time);
    if(database[date][side][time].length < MAX_OCCUPANCY) {
        debug('There is space remaining for this hour');
        if(haveResForDate(database[date], userIp)) {
            res.json(400, {message: 'Sorry, you alreay have a reservation for this day, please leave time for other members'})
        } else {
            database[date][side][time].push(reqBody);
            res.json({message: 'Ack'});
        }
    } else {
        res.json(400, {message: 'That time slot is full'})
    }
});

router.delete('/:side:(small|large)/:date(\\d{4}-\\d{2}-\\d{2})/:hour(\\d{1,2})', function (req, res, next) {
    const side = req.params.side;
    const date = req.params.date;
    const time = req.params.hour;
    const userIp = req.header('x-forwarded-for') ||  req.connection.remoteAddress;

    database[date][side][time] = database[date][time].filter(res => userIp !== res.ip);

    res.json({message: 'ack'})
});

module.exports = router;
