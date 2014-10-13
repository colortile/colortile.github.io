FastClick.attach(document.body);

$('header, #tiles *').attr('unselectable', 'on')
    .css({'-moz-user-select': '-moz-none',
        '-moz-user-select': 'none',
        '-o-user-select': 'none',
        '-khtml-user-select': 'none',
        '-webkit-user-select': 'none',
        '-ms-user-select': 'none',
        'user-select': 'none'
    }).bind('selectstart', function () {
        return false;
    });

var conf = {
    level: {start: 1, end: 55, current: 0},
    size: {start: 2, end: 8, current: 0},
    tiles: {selector: '#tiles', width: 320, margin: 5, content: undefined},
    gap: {min: 10, current: 0},
    time: {max: 60, current: 0},
    score: 0,
    combo: {max: 0, current: 0},
    debug: false,
    title: [
        [0, "색감 도전자"],
        [10, "색감 거지"],
        [20, "색감 노예"],
        [25, "색감 농노"],
        [30, "색감 소작농"],
        [34, "색감 평민"],
        [37, "색감 상인"],
        [39, "색감 도매상"],
        [41, "색감 사장"],
        [43, "색감 거상"],
        [45, "색감 장인"],
        [50, "색감 명인"],
        [55, "색감 명장"],
        [60, "색감 거장"],
        [65, "색감 기사"],
        [70, "색감 왕"],
        [75, "색감 대왕"],
        [80, "색감 황제"],
        [90, "색감 신"]
    ]
};

function init() {
    conf.tiles.content = $(conf.tiles.selector);
    conf.tiles.content.empty();
    conf.tiles.width = conf.tiles.content.width();
    conf.tiles.content.css('height', conf.tiles.width + 'px');
    conf.level.current = conf.level.start;
    conf.size.current = conf.size.start;
    conf.gap.current = conf.level.end;
    conf.time.current = conf.time.max;
    conf.combo.max = 0;
    conf.combo.current = 0;
    conf.score = 0;

    $('div.panel').css({height: conf.tiles.width + 'px', width: conf.tiles.width + 'px'});
    update_status();
}

function get_title(score) {
    var title = conf.title[0][1];
    var score = parseInt(score);
    for (var idx in conf.title) {
        if (score >= conf.title[idx][0]) title = conf.title[idx][1];
    }
    return title;
}

function update_status() {
    $('strong.score, span.score').text(conf.score);
    $('#time').text(conf.time.current);
    $('#timer').find('progress').attr({
        value: conf.time.current,
        max: conf.time.max
    });
    $('span.title').text(get_title(conf.score));
    $('span.combo').text(conf.combo.max);
}

// global functions
function log(message) {
    if (conf.debug) console.log(message)
}

function render(level, size) {
    // inner functions
    function rnd255() {
        return Math.floor(Math.random() * (255 - conf.level.end * 2)) + conf.level.end;
    }

    function randomColor() {
        var r = rnd255();
        var g = rnd255();
        var b = rnd255();
        var gap = conf.gap.current;
        var baseColor, answerColor;

        if (Math.random() > 0.5) {
            // The answer is brighter than the base color.
            baseColor = toColor(r, g, b);
            answerColor = toColor(r + gap, g + gap, b + gap);
        } else {
            answerColor = toColor(r, g, b);
            baseColor = toColor(r + gap, g + gap, b + gap);
        }

        return {base: baseColor, answer: answerColor};
    }

    function toColor(r, g, b) {
        r = ('00' + r.toString(16)).substr(-2);
        g = ('00' + g.toString(16)).substr(-2);
        b = ('00' + b.toString(16)).substr(-2);

        return '#' + r + g + b;
    }

    function set_gap_current() {
        conf.gap.current = (conf.level.end + 1) - level;
        if (conf.gap.current < conf.gap.min) conf.gap.current = conf.gap.min;
    }

    // init
    var tile_width = Math.floor((conf.tiles.width - conf.tiles.margin * size) / size);
    var tile_count = size * size;
    set_gap_current();
    var colors = randomColor();
    var anwser_index = Math.floor(Math.random() * tile_count);

    // draw
    conf.tiles.content.find('.answer').removeClass('answer');
    var current_tile = conf.tiles.content.find('.tile').size();
    for (var i = current_tile; i < tile_count; i++) {
        conf.tiles.content.append('<div class="tile"/>');
    }
    $('#tiles > div.tile').css({
        width: tile_width + 'px',
        height: tile_width + 'px',
        backgroundColor: colors.base
    });
    $('#tiles > div.tile').eq(anwser_index)
        .css("background-color", colors.answer)
        .addClass('answer');
}


var stage = new function () {
    this.run = run;
    function run(condition) {
        update_status();
        render(conf.level.current, conf.size.current);
        if (condition === 'hold') return false;
        conf.level.current++;
        conf.size.current = Math.min(conf.size.end, ++conf.size.current);
    }

    function right(element) {
        conf.score++;
        run();
        log('right!');
        new hit(true, element);
    }

    function wrong(element) {
        log('wrong!');
        new hit(false, element);
    }

    function hit(is_answer, element) {
        var effect = $('<div class="hit"/>');
        if (is_answer) {
            conf.combo.current++;
            effect.text('+' + conf.combo.current);
            conf.combo.max = Math.max(conf.combo.current, conf.combo.max);
        } else {
            conf.combo.current = 0;
            effect.text('땡')
                .addClass('wrong');
        }
        effect.css({
            width: element.width() + 'px',
            lineHeight: element.height() + 'px'
        });
        element.append(effect);
        effect.fadeOut(500, function () {
            $(this).remove();
        });
    }

    this.tile_click = function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).hasClass('answer') ? right($(this)) : wrong($(this));
        log('score : ' + conf.score);
    }
};

init();


var game = new function () {
    function reset() {
        log('game reset');
        $('#start').show();
        $('#end').hide();
        init();
        timer.stop();
    }

    this.start = function () {
        reset();
        log('game start');
        $('#start').hide();
        stage.run();
        timer.start();
    };
    this.end = function () {
        log('game end');
        $('#end').show();
    };
    this.reset = reset;
    $('#tiles').on('touchstart click', 'div.tile', stage.tile_click);
};

$('div.panel').on('click', 'button.start', game.start);
$(window).resize(game.reset);

var timer = new function () {
    var set_timer;

    function start() {
        conf.time.current--;
        update_status();
        if (conf.time.current <= 0) {
            game.end();
        } else {
            set_timer = setTimeout(start, 1000);
        }
    }

    this.start = function () {
        start();
    };
    this.stop = function () {
        clearTimeout(set_timer);
    };
};

function get_share_desc() {
    return conf.score + '점(연속+' + conf.combo.max + ') 획득! 당신은 ' + get_title(conf.score) + '!!'
}

$('#kakaostory-share').on('click', executeKakaoStoryLink);

function executeKakaoStoryLink() {
    var meta_desc = $('meta[name="description"]').attr('content');
    var meta_title = $('meta[name="title"]').attr('content');
    kakao.link("story").send({
        post: "틀린 타일 찾기! " + get_share_desc() + " - http://colortile.github.io/",
        appid: "colortile.github.io",
        appver: "1.0",
        appname: meta_title,
        urlinfo: JSON.stringify({
            title: meta_title,
            desc: meta_desc,
            imageurl: ["http://colortile.github.io/static/images/apple-touch-icon-144x144.png"],
            type: "website"})
    });
}

