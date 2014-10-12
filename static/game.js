$('body, body *').attr('unselectable', 'on')
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
    level: {start: 1, end: 50, current: 1},
    size: {start: 3, end: 8, current: 3},
    tiles: {selector: '#tiles', width: 320, margin: 5, content: undefined},
    gap: {min: 5, current: 50},
    time: {max: 60, current: 0},
    score: 0,
    debug: false,
    title: [
        "색감 도전자",
        "색감 노예",
        "색감 거지",
        "색감 평민",
        "색감 상인",
        "색감 장인",
        "색감 기사",
        "색감 왕",
        "색감 황제"
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
    conf.score = 0;

    $('.panel').css({height: conf.tiles.width + 'px', width: conf.tiles.width + 'px'});
    update_status();
}

function get_title(score) {
    var title = conf.title[0];
    var score = parseInt(score);
    if (score >= 10) title = conf.title[1];
    if (score >= 20) title = conf.title[2];
    if (score >= 30) title = conf.title[3];
    if (score >= 40) title = conf.title[4];
    if (score >= 50) title = conf.title[5];
    if (score >= 60) title = conf.title[6];
    if (score >= 70) title = conf.title[7];
    if (score >= 80) title = conf.title[8];
    return title;
}

function update_status() {
    $('.score').text(conf.score);
    $('#time').text(conf.time.current);
    $('#timer').find('progress').attr({
        value: conf.time.current,
        max: conf.time.max
    });
    $('.title').text(get_title(conf.score));
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

    function plus_gap(color) {
        return parseInt(color + conf.gap.current);
    }

    function parse_color(rgb_color) {
        return "#" + rgb_color.r.toString(16) + rgb_color.g.toString(16) + rgb_color.b.toString(16)
    }

    function set_gap_current() {
        conf.gap.current = (conf.level.end + 1) - level;
        if (conf.gap.current < conf.gap.min) conf.gap.current = conf.gap.min;
    }

    // init
    var tile_width = (conf.tiles.width - (conf.tiles.margin * size)) / size;
    var tile_count = size * size;
    set_gap_current();
    var base_color = {r: rnd255(), g: rnd255(), b: rnd255()};
    var anwser_color = {r: plus_gap(base_color.r), g: plus_gap(base_color.g), b: plus_gap(base_color.b)};
    var anwser_index = Math.floor(Math.random() * tile_count);

    // draw
    conf.tiles.content.find('.answer').removeClass('answer');
    var current_tile = conf.tiles.content.find('.tile').size();
    for (var i = current_tile; i < tile_count; i++) {
        conf.tiles.content.append('<div class="tile id_' + i + '"/>');
    }
    $('.tile').css({
        width: tile_width + 'px',
        height: tile_width + 'px',
        backgroundColor: parse_color(base_color)
    });
    $('.tile').eq(anwser_index)
        .css("background-color", parse_color(anwser_color))
        .addClass('answer');
}


var stage = new function () {
    this.run = run;
    function run(condition) {
        update_status();
        render(conf.level.current, conf.size.current);
        if (condition === 'hold') return false;
        conf.level.current++;
        conf.size.current >= conf.size.end ? conf.size.current = conf.size.end : conf.size.current++;
    }

    function right() {
        conf.score++;
        run();
        log('right!');
    }

    function wrong() {
        log('wrong!');
    }

    this.tile_click = function () {
        $(this).hasClass('answer') ? right() : wrong();
        log('score : ' + conf.score);
    }
};

init();

function get_share_desc() {
    return conf.score + '점 획득! 당신은 색감 ' + get_title(conf.score) + '!!'
}

var game = new function () {
    var $meta_desc = $('meta[name="description"]');
    console.log($meta_desc);
    function reset() {
        log('game reset');
        if ($meta_desc.data('content') != undefined) {
            $meta_desc.attr('content', $meta_desc.data('content'));
        }
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
        $meta_desc.data('content', $meta_desc.attr('content'));
        $meta_desc.attr('content', get_share_desc())
        log('game end');
        $('#end').show();
    };
    this.reset = reset;
    $('#tiles').on('click', 'div.tile', stage.tile_click);
};

$('.panel').on('click', 'button.start', game.start);
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

$('#kakaostory-share').on('click', executeKakaoStoryLink);

function executeKakaoStoryLink() {
    kakao.link("story").send({
        post: "틀린 타일 찾기! " + get_share_desc() + " - http://colortile.github.io/",
        appid: "colortile.github.io",
        appver: "1.0",
        appname: "틀린 타일 찾기",
        urlinfo: JSON.stringify({
            title: "틀린 타일 찾기",
            desc: "틀린 타일을 찾아 당신의 색감을 확인해보세요.",
            imageurl: ["http://colortile.github.io/static/images/apple-touch-icon-144x144.png"],
            type: "website"})
    });
}