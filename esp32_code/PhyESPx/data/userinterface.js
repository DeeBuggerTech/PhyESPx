



    function toggleMeasuring() {
        if (measuring)
            ajax("control?cmd=stop");
        else
            ajax("control?cmd=start");
    }


    function updateMeasuring(serverMeasuring) {
        if (fatalStop)
            return;

       measuring = serverMeasuring

        if (measuring)
            header.classList.add("active");
        else
            header.classList.remove("active");

    }


    function askSessionReload() {
        if (window.confirm("The phyphox session has changed. Do you want to reload this window?"))
            window.location.reload(true);
    }



    function updateViews() {
       views[currentView]["elements"].forEach(function(ve) {
              if (ve.hasOwnProperty("dataInputFunction"))  ve["dataInputFunction"](data);
              if (ve.hasOwnProperty("dataCompleteFunction"))  ve["dataCompleteFunction"]();
       });
    }


    function recreateViews() {
        viewsNode.innerHTML = "";
        for (i = 0; i < nElements; i++)
            elementData[i] = {};

        views[currentView]["elements"].forEach(function(ve) {
            viewsNode.innerHTML += ("<div class=\"elementBlock\">" + ve["html"] + "</div>");
        });
        adjustColors();
    }

    function switchView(newView) {
        leaveExclusive();
        currentView = newView;
        updateUsedVarStr();

        var liElements = viewSelector.getElementsByTagName("li");
        for (var i = 0; i < liElements.length; i++) {
            var el = liElements[i];
            if (i == currentView)
                el.classList.add("active");
            else
                el.classList.remove("active");
        };
        recreateViews();
    }



    function clearData() { //modified
        if (confirm("Aufgenommene Daten löschen?")) {

        ajax("control?cmd=clear");

        data = [];

        recreateViews();

        }
    }



    function exportData() {
            exportDialog.style.display = "block";
    }

    function hideExport() {
        exportDialog.style.display = "none";
    }

    function switchColumns(columns) {
        saveSetting("columns", columns);
        leaveExclusive();
        body.classList.remove("columns1");
        body.classList.remove("columns2");
        body.classList.remove("columns3");
        body.classList.remove("phone");
        body.classList.add("columns"+columns);
    }

    function switchToPhoneLayout() {
        saveSetting("columns", 0);
        leaveExclusive();
        body.classList.remove("columns1");
        body.classList.remove("columns2");
        body.classList.remove("columns3");
        body.classList.add("phone");
    }

    function setExclusive(i) {
        body.classList.add("exclusive");
        var elem = document.getElementById("element"+i);
        elem.classList.add("exclusive");
    }

    function leaveExclusive() {
        body.classList.remove("exclusive");

        var elements = document.getElementsByClassName("exclusive");
        for (var i = 0; i < elements.length; i++) {
            var elem = elements[i];
            elem.classList.remove("exclusive");
        };
    }

    function toggleExclusive(i) {
        var elem = document.getElementById("element"+i);
        if ((elem.classList && elem.classList.contains("exclusive")) || (elem.className.indexOf("exclusive") > -1))
            leaveExclusive();
        else
            setExclusive(i);
    }

    function zoomLarger(e) {
        leaveExclusive();
        if (scaleFactor < 3)
            scaleFactor *= 1.2;
        saveSetting("scaleFactor", scaleFactor);
        body.style.fontSize = (100*scaleFactor)+"%";
        e.stopPropagation();
        recreateViews();
    }

    function zoomSmaller(e) {
        leaveExclusive();
        if (scaleFactor > 0.5)
            scaleFactor /= 1.2;
        saveSetting("scaleFactor", scaleFactor);
        body.style.fontSize = (100*scaleFactor)+"%";
        e.stopPropagation();
        recreateViews();
    }

    function zoomDefault(e) {
        leaveExclusive();
        scaleFactor = 1.0;
        saveSetting("scaleFactor", scaleFactor);
        body.style.fontSize = (100*scaleFactor)+"%";
        e.stopPropagation();
        recreateViews();
    }

    function toggleBrightMode(e) {
        brightMode = body.classList.toggle("brightMode");

        saveSetting("brightMode", brightMode);
        recreateViews();
    }

    function toggleMenu(e) {
        if (moreMenu.style.display == "none")
            moreMenu.style.display = "block";
        else
            moreMenu.style.display = "none";
        if (!e)
            e = window.event;
        e.stopPropagation();
    }

    function hideMenu() {
        moreMenu.style.display = "none";
    }

    function ready(fn) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }


    //Color helpers
        //https://stackoverflow.com/a/17243070/8068814
        function HSVtoRGB(hsv) {
            var r, g, b, i, f, p, q, t, h, s, v;
            h = hsv.h;
            s = hsv.s;
            v = hsv.v;
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }
            var rgb = Math.round(r * 255) * 256 * 256 + Math.round(g * 255) * 256 + Math.round(b * 255);
            return "#"+ ('000000' + ((rgb)>>>0).toString(16)).slice(-6);
        }

        function stringToRGB(rgb) {
            var r,g,b;
            var rgbsep = rgb.replace(/[^\d,]/g, '').split(',');
            if (rgbsep.length == 3) {
                r = parseInt(rgbsep[0]);
                g = parseInt(rgbsep[1]);
                b = parseInt(rgbsep[2]);
            } else {
                var i = parseInt(rgb.slice(1), 16);
                r = (i >> 16) & 255;
                g = (i >> 8) & 255;
                b = i & 255;
            }
            return {r:r, g:g, b:b};
        }

        function RGBtoHSV(rgb) {
            var r = rgb.r;
            var g = rgb.g;
            var b = rgb.b;

            var max = Math.max(r, g, b), min = Math.min(r, g, b),
                d = max - min,
                h,
                s = (max === 0 ? 0 : d / max),
                v = max / 255;

            switch (max) {
                case min: h = 0; break;
                case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
                case g: h = (b - r) + d * 2; h /= 6 * d; break;
                case b: h = (r - g) + d * 4; h /= 6 * d; break;
            }

            return {
                h: h,
                s: s,
                v: v
            };
        }

        //Convert colors if in bright mode
        function adjustableColor(c) {
            if (brightMode) {
                //Convert to HSV, to HSL, invert Lightness and convert back to HSL and HSV
                var rgb = stringToRGB(c);
                if (rgb.r == 0x40 && rgb.g == 0x40 && rgb.b == 0x40)
                    return "#ffffff";
                var hsv = RGBtoHSV(rgb);
                var l = (2.0 - hsv.s) * hsv.v / 2.0;
                var s = l && l<1 ? hsv.s*hsv.v/(l < 0.5 ? l*2.0 : 2.0 - l*2.0) : 0.0
                l = 1.0 - l;
                var t = s * (l < 0.5 ? l : 1.0-l);
                hsv.v = l+t;
                hsv.s = l > 0 ? 2*t/hsv.v : 0.0;
                return HSVtoRGB(hsv);
            } else {
                return c;
            }
        }

        function adjustColors() {
            var adjustables = document.getElementsByClassName("adjustableColor");
            for(var i = 0; i < adjustables.length; i++) {
                var adjustable = adjustables[i];
                if (adjustable.style.color != null)
                    adjustable.style.color = adjustableColor(adjustable.style.color);
                if (adjustable.style.backgroundColor != null)
                    adjustable.style.backgroundColor = adjustableColor(adjustable.style.backgroundColor);
            }
        }






     //Draw a frame around the plots
        Chart.plugins.register({
            beforeDatasetsDraw: function(chartInstance) {
            },
            afterDatasetsDraw: function(chartInstance) {
                var ctx = chartInstance.chart.ctx;
                var chartArea = chartInstance.chartArea;
                ctx.strokeStyle = adjustableColor("#ffffff");
                ctx.lineWidth = scaleFactor;
                ctx.strokeRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
            },
            afterUpdate: function(chart) {
                if (chart.tooltip._active) {
                    chart.tooltip.update();
                }
            }
        });

        //Remove first and/or last tick if it is not placed at the same interval as the other ticks
        function filterEdgeTicks(axis) {
            var ticks = axis.ticks;
            if (ticks.length > 3) {
                var regularDistance = Math.abs(ticks[2] - ticks[1]);
                if (Math.abs(ticks[1]-ticks[0]) - regularDistance < -regularDistance * 1e-6) //allow for some imprecision to not remove regular ticks at exactly given axis limits
                    ticks.splice(0,1);
                if (Math.abs(ticks[ticks.length-1]-ticks[ticks.length-2]) - regularDistance < -regularDistance * 1e-6)
                    ticks.splice(ticks.length-1,1);
            }
        }

        //Colormap graph style
        Chart.defaults.colormap = Chart.defaults.line;
        var colormap = Chart.controllers.line.extend({
            draw: function(ease) {

                var meta = this.getMeta();
                var data = this.getDataset().data;
                var chartArea = this.chart.chartArea;
                var mapwidth = meta.controller.chart.config.mapwidth;
                var colorscale= meta.controller.chart.config.colorscale;
                var mapheight = data.length/mapwidth;

                if (!(mapheight > 1))
                    return;

                var mapCanvas = document.createElement('canvas');
                mapCanvas.width = mapwidth;
                mapCanvas.height = mapheight;
                var mapctx = mapCanvas.getContext("2d");

                var minZ = meta.controller.chart.minZ;
                var maxZ = meta.controller.chart.maxZ;
                var logZ = meta.controller.chart.logZ;

                if (logZ) {
                    if (minZ < 1e-12)
                        minZ = 1e-12;
                    if (maxZ < 1e-12)
                        maxZ = 1e-12;
                    minZ = Math.log(minZ);
                    maxZ = Math.log(maxZ);
                }

                var map = mapctx.createImageData(mapwidth, mapheight);

                var onScaleFactor = (colorscale.length-1) / (maxZ - minZ);
                for (var i = 0; i < mapwidth * mapheight; i++) {
                    var z = data[i].z;
                    if (logZ) {
                        if (z < 1e-12)
                            continue;
                        z = Math.log(z);
                    }

                    var onColorScale = (z - minZ) * onScaleFactor;

                    var index = Math.floor(onColorScale);
                    if (index > colorscale.length-2)
                        index = colorscale.length-2;
                    else if (index < 0)
                        index = 0;

                    var inbetween = onColorScale - index;
                    if (inbetween > 1)
                        inbetween = 1;
                    else if (inbetween < 0)
                        inbetween = 0;

                    var r1 = (colorscale[index] & 0x00ff0000) >>> 16;
                    var g1 = (colorscale[index] & 0x0000ff00) >>> 8;
                    var b1 = (colorscale[index] & 0x000000ff) >>> 0;
                    var r2 = (colorscale[index+1] & 0x00ff0000) >>> 16;
                    var g2 = (colorscale[index+1] & 0x0000ff00) >>> 8;
                    var b2 = (colorscale[index+1] & 0x000000ff) >>> 0;

                    var r = Math.round(r1 * (1.-inbetween) + r2 * inbetween) & 0xff;
                    var g = Math.round(g1 * (1.-inbetween) + g2 * inbetween) & 0xff;
                    var b = Math.round(b1 * (1.-inbetween) + b2 * inbetween) & 0xff;

                    map.data[4*i] = r;
                    map.data[4*i+1] = g;
                    map.data[4*i+2] = b;
                    map.data[4*i+3] = 255;
                }
                mapctx.putImageData(map, 0, 0);

                var ctx = this.chart.chart.ctx;
                ctx.save();
                ctx.scale(1, -1);
                ctx.drawImage(mapCanvas, 0.5, 0.5, mapwidth-1, mapheight-1, chartArea.left, -chartArea.bottom, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
                ctx.restore();

                Chart.controllers.line.prototype.draw.call(this, ease);
            }
        });
        Chart.controllers.colormap = colormap;
