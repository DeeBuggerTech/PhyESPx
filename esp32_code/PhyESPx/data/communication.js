//We implement a simple queue for ajax to avoid concurrent requests
    var ajaxRequestQueue = [];
    var ajaxRequestRunning = false;
    var fatalStop = false;

    function ajax(url, success, fail, always, timeout) {
        if (fatalStop)
            return;

        var request = new XMLHttpRequest();

        request.open('GET', url, true);

        if (typeof timeout !== "undefined")
            request.timeout = timeout;
        else
            request.timeout = 3000;

        request.onreadystatechange = function() {

            if (request.readyState == 4) {
                var next = ajaxRequestQueue.shift();
                if (next && !fatalStop) {
                    setTimeout(function(){next.send()}, 10); //Add a short delay to avoid flooding the single-threaded webserver of phyphox
                } else
                    ajaxRequestRunning = false;

                if (request.status >= 200 && request.status < 400) {
                    if (typeof success !== 'undefined')
                        success(JSON.parse(request.responseText));
                } else {
                    if (typeof fail !== 'undefined')
                        fail();
                }
                if (typeof always !== 'undefined')
                    always();
            }

        };

        if (ajaxRequestRunning)
            ajaxRequestQueue.push(request);
        else {
            ajaxRequestRunning = true;
            request.send();
        }

    }


/**
    function composeVarStr(name, partial, partialComponent) {
        var namePart = encodeURIComponent(name);
        if (partial == "full")
            return namePart + "=full";
        if (partial == "partial" || partial == "partialXYZ") {
            if ((!forceFull) && data.hasOwnProperty(partialComponent) && data[partialComponent]["data"].length > 0 && data.hasOwnProperty(name) && data[name]["data"].length > 0) {
                if (partialComponent == name)
                    return namePart + "=" + data[partialComponent]["data"][data[partialComponent]["data"].length-1];
                else {
                    var minLength = Math.min(data[partialComponent]["data"].length, data[name]["data"].length);
                    return namePart + "=" + data[partialComponent]["data"][minLength-1] + "|" + encodeURIComponent(partialComponent);
                }
            } else
                return namePart + "=full";
        }
        return namePart;
    }
    **/

    function updateUsedVarStr() {
    /**
        var usedVars = [];
        var modePriority = [];
        views[currentView]["elements"].forEach(function(ve) {
            if (ve.hasOwnProperty("dataInput")) {
                for (var index = 0; index < ve["dataInput"].length; index++) {
                    if (ve["dataInput"][index] == null)
                        continue;
                    let varStr = ve["dataInput"][index];
                    let varKey = "buffer:" + varStr;
                    if (ve["updateMode"] == "single" || ve["updateMode"] == "input") {
                        if (modePriority[varStr] >= 1)
                            continue;
                        usedVars[varKey] = composeVarStr(varStr, "single");
                        modePriority[varKey] = 1;
                    } else if (ve["updateMode"] == "partial") {
                        if (modePriority[varKey] >= 2)
                            continue;
                        var dependentVar = ((ve["dataInput"].length > index + 1) && (index % 2 == 0)) ? ve["dataInput"][index+1] : ve["dataInput"][index];
                        usedVars[varKey] = composeVarStr(varStr, "partial", dependentVar);
                        modePriority[varKey] = 2;
                    } else if (ve["updateMode"] == "partialXYZ") {
                        if (modePriority[varKey] >= 3)
                            continue;
                        var dependentVar = ve["dataInput"][Math.floor(index / 3)];
                        usedVars[varKey] = composeVarStr(varStr, "partialXYZ", dependentVar);
                        modePriority[varKey] = 3;
                    } else if (ve["updateMode"] == "full") {
                        if (modePriority[varKey] >= 4)
                            continue;
                        usedVars[varKey] = composeVarStr(varStr, "full");
                        modePriority[varKey] = 4;
                    }
                }
            }
        });

        usedVarStr = "";
        for (var usedVar in usedVars) {
            if (usedVarStr != "")
                usedVarStr += "&";
            usedVarStr += usedVars[usedVar];
        }
        forceFull = false;
        **/
        usedVarStr = "";
    }

    function nullToNaN(array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == null) {
              array[i] = NaN;
            }
        }
        return array;
    }




    function updateData() {
        updateUsedVarStr();
        ajax("get?" + usedVarStr,
            function( jsonData ) { //success

                for (var index in jsonData["data"]) {

                if(data[index] == null) data[index] = [];

                if(measuring && jsonData["data"][index]!= "") data[index].push(jsonData["data"][index]);

/**
                console.log("index: ");
                console.log(index);
                console.log("data: ");
                console.log(data[index]);
**/


                }

                updateViews();
                updateMeasuring(jsonData["measuring"]);
                errorNode.style.display = "none";


            },
            function() { //fail
                errorNode.textContent = "Communication error: Cannot reach PhyESPx server!";
                errorNode.style.display = "block";
            },
            function() { //always
                if (measuring)
                    setTimeout(updateData, timeout_measuring);
                else
                    setTimeout(updateData, timeout_ready);
            },
            10000
        );
    }