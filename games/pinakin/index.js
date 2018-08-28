var summedValue = 0;
$(document).ready(function () {
    loadGamePlay();
    updatePlayerList();
    $('.newPlayer').click(function () {
        $('.addPlayers').fadeToggle();
    });

    $('.clearAll').click(function () {
        localStorage.removeItem('players');
        localStorage.removeItem('scores');
        location.reload();
    });

    $('.startGame').click(function () {
        summedValue = 0;
        startGame();
        $('.finalResults').fadeOut();
    });

    $('.results').click(function () {
        var players = localStorage.players;
        var scores = localStorage.scores;
        if (!players || !scores) {
            alert("No data found");
            return;
        }
        players = JSON.parse(players);
        scores = JSON.parse(scores);

        var resultScore = {};
        for (var jCount = 0; jCount < players.length; jCount++) {
            resultScore[players[jCount]] = 0;
        }
        for (var iCount = 0; iCount < scores.length; iCount++) {
            for (var jCount = 0; jCount < players.length; jCount++) {
                resultScore[players[jCount]] += parseInt(scores[iCount][players[jCount]].score);
            }
        }
        var htmlCont = '';
        var winner = '';
        var totalPoints = 0;
        for (var iCount = 0; iCount < Object.keys(resultScore).length; iCount++) {
            var key = Object.keys(resultScore)[iCount];
            var value = resultScore[key];
            if (value > totalPoints) {
                totalPoints = value;
                winner = key;
            }
            htmlCont += '<div><p class="user">' + key + '</p><p class="data">' + value + '</p></div>';
        }
        alert("Winner is " + winner + ": " + totalPoints);
        $('.finalResults').html(htmlCont);
        $('.finalResults').fadeToggle();
    });

    $('.add').click(function () {
        var players = localStorage.players;
        var name = $('.playerName').val();
        if (!name) {
            alert("Player name cannot be empty");
            return;
        }
        if (players)
            players = JSON.parse(players);
        else
            players = [];

        players.push(name);
        localStorage.players = JSON.stringify(players);
        updatePlayerList();
        $('.playerName').val('');
        $('.addPlayers').fadeOut();
    });
    $('html').click(function (e) {
        if ($(e.target).parents('.addPlayers').length == 0 && e.target.className.indexOf('newPlayer') == -1)
            $('.addPlayers').fadeOut();

        //if ($(e.target).parents('.currentGame').length == 0 && e.target.className.indexOf('startGame') == -1)
        //    $('.currentGame').fadeOut();
    });
});

function loadGamePlay() {
    var players = localStorage.players;
    var scores = localStorage.scores;
    if (!players)
        return;

    players = JSON.parse(players);
    if (!scores) {
        scores = [];
    } else {
        scores = JSON.parse(scores);
    }

    var html = '<tr>';
    for (var jCount = 0; jCount < players.length; jCount++) {
        html += '<th>' + players[jCount] + '</th>';
    }
    $('.showProgress thead').html(html + '</tr>');
    $('.showProgress tbody').html('');
    for (var iCount = 0; iCount < scores.length; iCount++) {
        var html = '<tr>';
        for (var jCount = 0; jCount < players.length; jCount++) {
            html += '<td>' + scores[iCount][players[jCount]].score + '</td>';
        }
        $('.showProgress tbody').append(html + '</tr>');
    }
}

function updatePlayerList() {
    var players = localStorage.players;
    $('.playersList').empty();

    if (!players)
        return;

    players = JSON.parse(players);
    for (var iCount = 0; iCount < players.length; iCount++) {
        $('.playersList').append('<div class="form-group"><p class="name">' + players[iCount] + '</p><input type="button" class="btn btn-danger deletePlayer" value="Remove"></div>');
    }

    $('.deletePlayer').click(function () {
        var players = localStorage.players;
        players = JSON.parse(players);
        var removeItem = $(this).siblings('p').text();

        players = jQuery.grep(players, function (value) {
            return value != removeItem;
        });
        localStorage.players = JSON.stringify(players);
        updatePlayerList();
    });
}

function startGame() {
    var entry = '<div class="form-group resultEntry element~"><label class="currentPlayer">{0}</label><input type="number" class="form-control" /></div>';

    var players = localStorage.players;
    $('.currentGame').empty();
    if (!players) {
        alert("No players available");
        return;
    }
    $('.currentGame').fadeToggle();

    players = JSON.parse(players);

    for (var iCount = 0; iCount < players.length; iCount++) {
        var currentEntry = entry.replace('{0}', players[iCount]).replace(/~/gi, iCount);
        $('.currentGame').append(currentEntry);
    }
    $('.currentGame').append('<input type="button" class="btn btn-primary endGame" value="End" />');

    $('.endGame').click(function () {
        endGame();
        loadGamePlay();
        $('.currentGame').fadeOut();
        $('.finalResults').fadeOut();
    });
}

function endGame() {
    var score = {
    }
    for (var iCount = 0; iCount < $('.resultEntry').length; iCount++) {
        var user = $('.element' + iCount + ' .currentPlayer').text();
        var finalScore = $('.element' + iCount + ' input').val();
       
        score[user] = {
            score: finalScore
        };
    }
    var scores = localStorage.scores;
    if (!scores)
        scores = [];
    else {
        scores = JSON.parse(scores);
    }
    scores.push(score);

    localStorage.scores = JSON.stringify(scores);
}