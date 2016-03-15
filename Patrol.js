/*
By: Kevin Hyer
*/

on("ready", function() {
    //Wait until the ready event fires so we know the campaign is completely loaded.

    /**
     * Returns all patrol tokens on the player's page
     */
    var getOnlinePlayers = function() {
        var currentPageId = Campaign().get("playerpageid");
        return findObjs({
            _type: "player",
            _online: true
        });
    };

    /**
     * Returns all patrol tokens on the player's page
     */
    var getPatrolTokens = function() {
        var currentPageId = Campaign().get("playerpageid");
        var playerPageTokens = [];
        playerPageTokens = findObjs({
            _pageid: currentPageId,
            _type: "graphic",
            aura1_square: true
        });

        var players = getOnlinePlayers();
        var playerSpecificPages = Campaign().get("playerspecificpages");
        
        if (playerSpecificPages !== false) {
            for (var i = 0; i < players.length; i++) {
                var playerID = players[i].get("_id");
                var playerPageID = playerSpecificPages[playerID];
                if (playerPageID === currentPageId) {
                    continue;
                }
                var specificPageTokens = [];
                specificPageTokens = findObjs({
                    _pageid: playerPageID,
                    _type: "graphic",
                    aura1_square: true
                });

                playerPageTokens.push.apply(playerPageTokens, specificPageTokens);
            }
        }
        
        return playerPageTokens;
    };

    var teleport = function(fromToken, toToken) {
        fromToken.set("left", toToken.get("left"));
        fromToken.set("top", toToken.get("top"));
    };

    var patrolTokens = getPatrolTokens();

    if (!patrolTokens.length === 0) {
        log("No Tokens to Patrol");
        return;
    }

    // 0 = didn't come from anywhere
    // 1 = came from left
    // 2 = came from up
    // 3 = came from right
    // 4 = came from down
    var from = [];
    for (var i = 0; i < patrolTokens.length; i++) {
        from[i] = 0;
    }

    on("change:player:_online", function() {
        patrolTokens = getPatrolTokens();
        for (var i = 0; i < patrolTokens.length; i++) {
            from[i] = 0;
        }
    });

    on("change:campaign:playerspecificpages", function() {
        patrolTokens = getPatrolTokens();
        for (var i = 0; i < patrolTokens.length; i++) {
            from[i] = 0;
        }
    });

    on("change:campaign:playerpageid", function() {
        patrolTokens = getPatrolTokens();
        for (var i = 0; i < patrolTokens.length; i++) {
            from[i] = 0;
        }
    });

    on("change:graphic", function(obj, prev) {
        patrolTokens = getPatrolTokens();
        for (var i = 0; i < patrolTokens.length; i++) {
            from[i] = 0;
        }
    });
    
    on("destroy:graphic", function(obj, prev) {
        patrolTokens = getPatrolTokens();
        for (var i = 0; i < patrolTokens.length; i++) {
            from[i] = 0;
        }
    });

    setInterval(function() {

        for (var i = 0; i < patrolTokens.length; i++) {

            var token = patrolTokens[i];

            var pathToUp = findObjs({
                _type: "graphic",
                left: token.get("left"),
                top: token.get("top") - token.get("height"),
                statusmarkers: "flying-flag",
                layer: "gmlayer"
            })[0];

            var pathToRight = findObjs({
                _type: "graphic",
                left: token.get("left") + token.get("width"),
                top: token.get("top"),
                statusmarkers: "flying-flag",
                layer: "gmlayer"
            })[0];

            var pathToDown = findObjs({
                _type: "graphic",
                left: token.get("left"),
                top: token.get("top") + token.get("height"),
                statusmarkers: "flying-flag",
                layer: "gmlayer"
            })[0];

            var pathToLeft = findObjs({
                _type: "graphic",
                left: token.get("left") - token.get("width"),
                top: token.get("top"),
                statusmarkers: "flying-flag",
                layer: "gmlayer"
            })[0];

            if (!pathToUp && !pathToRight && !pathToDown && !pathToLeft) {
                log("NO PATH for token " + i + " at x: " + Math.floor(token.get("left") / 70) + " y: " + Math.floor(token.get("top") / 70));
                return;
            }

            if (from[i] === 0) {
                if (pathToLeft) {
                    teleport(token, pathToLeft);
                    from[i] = 3;
                } else if (pathToRight) {
                    teleport(token, pathToRight);
                    from[i] = 1;
                } else if (pathToUp) {
                    teleport(token, pathToUp);
                    from[i] = 4;
                } else if (pathToDown) {
                    teleport(token, pathToDown);
                    from[i] = 2;
                }
            } else if (from[i] === 2) {
                if (pathToRight) {
                    teleport(token, pathToRight);
                    from[i] = 1;
                } else if (pathToDown) {
                    teleport(token, pathToDown);
                    from[i] = 2;
                } else if (pathToLeft) {
                    teleport(token, pathToLeft);
                    from[i] = 3;
                } else if (pathToUp) {
                    teleport(token, pathToUp);
                    from[i] = 4;
                }
            } else if (from[i] === 3) {
                if (pathToDown) {
                    teleport(token, pathToDown);
                    from[i] = 2;
                } else if (pathToLeft) {
                    teleport(token, pathToLeft);
                    from[i] = 3;
                } else if (pathToUp) {
                    teleport(token, pathToUp);
                    from[i] = 4;
                } else if (pathToRight) {
                    teleport(token, pathToRight);
                    from[i] = 1;
                }
            } else if (from[i] === 4) {
                if (pathToLeft) {
                    teleport(token, pathToLeft);
                    from[i] = 3;
                } else if (pathToUp) {
                    teleport(token, pathToUp);
                    from[i] = 4;
                } else if (pathToRight) {
                    teleport(token, pathToRight);
                    from[i] = 1;
                } else if (pathToDown) {
                    teleport(token, pathToDown);
                    from[i] = 2;
                }
            } else if (from[i] === 1) {
                if (pathToUp) {
                    teleport(token, pathToUp);
                    from[i] = 4;
                } else if (pathToRight) {
                    teleport(token, pathToRight);
                    from[i] = 1;
                } else if (pathToDown) {
                    teleport(token, pathToDown);
                    from[i] = 2;
                } else if (pathToLeft) {
                    teleport(token, pathToLeft);
                    from[i] = 3;
                }
            }
        }
    }, 1000); //how many milliseconds for each movement

});