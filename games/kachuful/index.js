var summedValue = 0;
var mapping = {
    1: 'Kali',
    2: 'Charkat',
    3: 'Falli',
    4: 'Laal',
    5: 'Laal',
    6: 'Falli',
    7: 'Charkat',
    8: 'Kali'
}
$(document).ready(function () {
    if (!localStorage.hasOwnProperty('cards'))
        localStorage.cards = 8;

    if (!localStorage.hasOwnProperty('reverse'))
        localStorage.reverse = 0;

    loadGamePlay();
    updatePlayerList();
    $('.newPlayer').click(function () {
        $('.addPlayers').fadeToggle();
    });

    $('.clearAll').click(function () {
        localStorage.removeItem('players');
        localStorage.removeItem('scores');
        localStorage.removeItem('reverse');
        localStorage.removeItem('cards');
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

    var html = '<tr><th>Trump</th>';
    for (var jCount = 0; jCount < players.length; jCount++) {
        html += '<th>' + players[jCount] + '</th>';
    }
    $('.showProgress thead').html(html + '</tr>');
    $('.showProgress tbody').html('');
    for (var iCount = 0; iCount < scores.length; iCount++) {
        var trump = scores[iCount].trump;
        var html = '<tr><td>' + trump + '</td>';
        for (var jCount = 0; jCount < players.length; jCount++) {
            html += '<td class="' + (scores[iCount][players[jCount]].correctPitch ? "correct" : "incorrect") + ' ' + (scores[iCount][players[jCount]].isBonus ? "bonus" : "nobonus") + '">' + scores[iCount][players[jCount]].prediction + '</td>';
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

function getOptions(ignoreItem) {
    var option = '';
    for (var iCount = 0; iCount <= localStorage.cards; iCount++) {
        if (iCount != ignoreItem)
            option += '<option>' + iCount + '</option>';
    }
    return option;
}
function startGame() {
    var entry = '<div class="form-group resultEntry element~"><label class="currentPlayer">{0}</label><select class="form-control"></select><input type="button" class="btn btn-info lock lock~" data-id="~" value="Lock" disabled /><label>Completed</label><input type="checkbox" class="form-control" value="Completed"></div>';

    var players = localStorage.players;
    $('.currentGame').empty();
    if (!players) {
        alert("No players available");
        return;
    }
    $('.currentGame').fadeToggle();

    players = JSON.parse(players);
    $('.currentGame').append('<h4><img src="' + mapping[localStorage.cards] + '.png" />' + mapping[localStorage.cards] + ' - ' + localStorage.cards + '</h4>');

    var options = getOptions((localStorage.cards + 1));
    for (var iCount = 0; iCount < players.length; iCount++) {
        var currentEntry = entry.replace('{0}', players[iCount]).replace(/~/gi, iCount);
        $('.currentGame').append(currentEntry);
        if (iCount == 0) {
            $('.currentGame select').html(options);
        }
    }
    $('.lock:nth(0)').attr('disabled', false);
    $('.currentGame').append('<input type="button" class="btn btn-primary endGame" value="End" disabled />');

    $('.endGame').click(function () {
        endGame();
        $('.currentGame').fadeOut();
        $('.finalResults').fadeOut();
    });

    $('.lock').click(function () {
        $(this).siblings('select').attr('disabled', true);
        var id = $(this).data('id');
        $('.lock:nth(' + id + ')').attr('disabled', true);
        $('.lock:nth(' + (id + 1) + ')').attr('disabled', false);

        var currentPlayerBid = parseInt($('.element' + id + ' select').val());
        summedValue += currentPlayerBid;

        var currentPlayer = $('.element' + id + ' .currentPlayer').text();
        var players = localStorage.players;
        players = JSON.parse(players);

        if ((players.length - 1) == id) {
            $('.endGame').attr('disabled', false);
        }

        var isLastPlayer = false;
        if (players.length == (id + 2))
            isLastPlayer = true;

        var options;
        if (isLastPlayer) {
            options = getOptions(localStorage.cards - summedValue);
        } else {
            options = getOptions(9);
        }
        $('.element' + (id + 1) + ' select').html(options);
    });
}

function endGame() {
    var total = $('.currentGame input[type="checkbox"]').length;
    var completed = $('.currentGame input[type="checkbox"]:checked').length;
    if (total == completed) {
        alert("All cannot be completed. Please correct the data.");
        return;
    }
    var score = {
        trump: $('.currentGame > h4').text()
    }
    for (var iCount = 0; iCount < $('.resultEntry').length; iCount++) {
        var user = $('.element' + iCount + ' .currentPlayer').text();
        var prediction = $('.element' + iCount + ' select').val();
        var correctPitch = $('.element' + iCount + ' input[type="checkbox"]').prop('checked');
        var finalScore;
        var isBonus = false;
        if (prediction == localStorage.cards && $('.enabledBonus:checked').length > 0) {
            finalScore = correctPitch ? (prediction > 0 ? (prediction * 2) : 1) : 0;
            if (correctPitch) {
                isBonus = true;
                finalScore = (prediction > 0 ? (prediction * 2) : 1);
            } else {
                finalScore = 0;
            }
        } else {
            finalScore = correctPitch ? (prediction > 0 ? prediction : 1) : 0;
        }
        score[user] = {
            score: finalScore,
            prediction: prediction,
            correctPitch: correctPitch,
            isBonus: isBonus
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
    var players = localStorage.players;
    players = JSON.parse(players);

    var playerName = players[0];
    players = jQuery.grep(players, function (value) {
        return value != playerName;
    });
    players.push(playerName);
    localStorage.players = JSON.stringify(players);

    loadGamePlay();

    if (parseInt(localStorage.reverse))
        localStorage.cards++;
    else
        localStorage.cards--;

    if (localStorage.cards == 0) {
        localStorage.cards++;
        localStorage.reverse = 1;
    }
    if (localStorage.cards == 9) {
        localStorage.cards--;
        localStorage.reverse = 0;
    }
}