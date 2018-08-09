﻿define(
    "chartx/chart/pie/3d/pie", [
        "canvax/index",
        "canvax/shape/Sector",
        "canvax/shape/Line",
        "canvax/shape/BrokenLine",
        "canvax/shape/Rect",
        "canvax/shape/Path",
        "chartx/utils/tools",
        "canvax/animation/AnimationFrame",
        "chartx/components/tips/tip",
        "chartx/chart/theme",
        "chartx/utils/colorformat"
    ],
    function (Canvax, Sector, Line, BrokenLine, Rect, Path, Tools, AnimationFrame, Tip, Theme, ColorFormat) {


        var PI = Math.PI,
            deg2rad = (PI / 180), // degrees to radians
            sin = Math.sin,
            cos = Math.cos,
            round = Math.round;

        /***
         EXTENSION TO THE SVG-RENDERER TO ENABLE 3D SHAPES
         ***/
        ////// HELPER METHODS //////

        var dFactor = (4 * (Math.sqrt(2) - 1) / 3) / (PI / 2);

        /** Method to construct a curved path
         * Can 'wrap' around more then 180 degrees
         */

        /** Method to construct a curved path
         * Can 'wrap' around more then 180 degrees
         */
        function curveTo(cx, cy, rx, ry, start, end, dx, dy) {
            var result = [];
            if ((end > start) && (end - start > PI / 2 + 0.0001)) {
                result = result.concat(curveTo(cx, cy, rx, ry, start, start + (PI / 2), dx, dy));
                result = result.concat(curveTo(cx, cy, rx, ry, start + (PI / 2), end, dx, dy));
            } else if ((end < start) && (start - end > PI / 2 + 0.0001)) {
                result = result.concat(curveTo(cx, cy, rx, ry, start, start - (PI / 2), dx, dy));
                result = result.concat(curveTo(cx, cy, rx, ry, start - (PI / 2), end, dx, dy));
            } else {
                var arcAngle = end - start;
                result = [
                    'C',
                    cx + (rx * cos(start)) - ((rx * dFactor * arcAngle) * sin(start)) + dx,
                    cy + (ry * sin(start)) + ((ry * dFactor * arcAngle) * cos(start)) + dy,
                    cx + (rx * cos(end)) + ((rx * dFactor * arcAngle) * sin(end)) + dx,
                    cy + (ry * sin(end)) - ((ry * dFactor * arcAngle) * cos(end)) + dy,

                    cx + (rx * cos(end)) + dx,
                    cy + (ry * sin(end)) + dy
                ];
            }
            return result;
        }

        var _attrs = ['side1', 'side2', 'inn', 'out', 'top'];


        var Pie = function (opt, tipsOpt, domContainer) {
            this.data = null;
            this.sprite = null;
            this.branchSp = null;
            this.sectorsSp = null;
            this.checkedSp = null;
            this.branchTxt = null;

            this.dataLabel = {
                enabled: true,
                allowLine: true,
                format: null
            };

            this.checked = {
                enabled: false
            }

            this.tips = _.deepExtend({
                enabled: true
            }, tipsOpt); //tip的confit
            this.domContainer = domContainer;
            this._tip = null; //tip的对象 tip的config 放到graphs的config中传递过来

            this.init(opt);
            this.colorIndex = 0;
            this.sectors = [];
            this.sectorMap = [];
            this.isMoving = false;
            this.labelMaxCount = 15;
            this.labelList = [];


        };

        Pie.prototype = {
            init: function (opt) {
                _.deepExtend(this, opt);
                this.sprite = new Canvax.Display.Sprite();

                this.sectorsSp = new Canvax.Display.Sprite();
                this.sprite.addChild(this.sectorsSp);

                this.checkedSp = new Canvax.Display.Sprite();
                this.sprite.addChild(this.checkedSp);

                this._tip = new Tip(this.tips, this.domContainer);
                this._tip._getDefaultContent = this._getTipDefaultContent;
                this.sprite.addChild(this._tip.sprite);
                if (this.dataLabel.enabled) {
                    this.branchSp = new Canvax.Display.Sprite();
                }
                this._configData();
                this._configColors();
            },
            clear: function () {
                // this.domContainer.removeChildren()
                this.domContainer.innerHTML = ''
            },
            setX: function ($n) {
                this.sprite.context.x = $n
            },
            setY: function ($n) {
                this.sprite.context.y = $n
            },
            //配置数据
            _configData: function () {
                var self = this;
                self.total = 0;
                self.angleOffset = _.isNaN(self.startAngle) ? 0 : self.startAngle;
                self.angleOffset = self.angleOffset % 360;
                self.currentAngle = 0 + self.angleOffset;
                var limitAngle = 360 + self.angleOffset;
                var adjustFontSize = 12 * self.boundWidth / 1000;
                self.labelFontSize = adjustFontSize < 12 ? 12 : adjustFontSize;
                var percentFixedNum = 2;
                var data = self.data.data;
                self.clickMoveDis = self.r / 11;
                if (data.length && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        self.total += data[i].y;
                    }
                    if (self.total > 0) {
                        var maxIndex = 0;
                        var maxPercentageOffsetIndex = 0;
                        var totalFixedPercent = 0;
                        for (var j = 0; j < data.length; j++) {
                            var percentage = data[j].y / self.total;
                            var fixedPercentage = +((percentage * 100).toFixed(percentFixedNum));
                            var percentageOffset = Math.abs(percentage * 100 - fixedPercentage);
                            totalFixedPercent += fixedPercentage;

                            if (j > 0 && percentage > data[maxIndex].orginPercentage) {
                                maxIndex = j;
                            }

                            if (j > 0 && percentageOffset > data[maxPercentageOffsetIndex].percentageOffset) {
                                maxPercentageOffsetIndex = j;
                            }

                            var angle = 360 * percentage;
                            var endAngle = self.currentAngle + angle > limitAngle ? limitAngle : self.currentAngle + angle;
                            var cosV = Math.cos((self.currentAngle + angle / 2) / 180 * Math.PI);
                            var sinV = Math.sin((self.currentAngle + angle / 2) / 180 * Math.PI);
                            var midAngle = self.currentAngle + angle / 2;
                            cosV = cosV.toFixed(5);
                            sinV = sinV.toFixed(5);
                            var quadrant = function (ang) {
                                if (ang >= limitAngle) {
                                    ang = limitAngle;
                                }
                                ang = ang % 360;
                                var angleRatio = parseInt(ang / 90);
                                if (ang >= 0) {
                                    switch (angleRatio) {
                                        case 0:
                                            return 1;
                                            break;
                                        case 1:
                                            return 2;
                                            break;
                                        case 2:
                                            return 3;
                                            break;
                                        case 3:
                                        case 4:
                                            return 4;
                                            break;
                                    }
                                } else if (ang < 0) {
                                    switch (angleRatio) {
                                        case 0:
                                            return 4;
                                            break;
                                        case -1:
                                            return 3;
                                            break;
                                        case -2:
                                            return 2;
                                            break;
                                        case -3:
                                        case -4:
                                            return 1;
                                            break;
                                    }
                                }
                            }(midAngle);
                            _.extend(data[j], {
                                start: self.currentAngle,
                                end: endAngle,
                                midAngle: midAngle,
                                outOffsetx: self.clickMoveDis * cosV,
                                outOffsety: self.clickMoveDis * sinV,
                                centerx: (self.r - self.clickMoveDis ) * cosV - (self.r - self.clickMoveDis ) * cosV * sin(deg2rad * self.rotation.y),
                                centery: (self.r + self.clickMoveDis ) * sinV - (self.r - self.clickMoveDis ) * sinV * sin(deg2rad * self.rotation.x),
                                outx: (self.r + self.clickMoveDis) * cosV,
                                outy: (self.r + self.clickMoveDis) * sinV,
                                edgex: (self.r + 2 * self.clickMoveDis ) * cosV,
                                edgey: (self.r + 2 * self.clickMoveDis) * sinV,
                                orginPercentage: percentage,
                                percentage: fixedPercentage,
                                percentageOffset: percentageOffset,
                                txt: fixedPercentage + '%',
                                quadrant: quadrant,
                                labelDirection: quadrant == 1 || quadrant == 4 ? 1 : 0,
                                index: j,
                                isMax: false,
                                checked: false //是否点击选中
                            });
                            self.currentAngle += angle;
                            if (self.currentAngle > limitAngle) self.currentAngle = limitAngle;
                        }

                        data[maxIndex].isMax = true;
                        //处理保留小数后百分比总和不等于100的情况
                        //总会有除不尽的情况（如1，1，1，每份都是33.33333...，没必要做修正）
                        //var totalPercentOffset = (100 - totalFixedPercent).toFixed(percentFixedNum);
                        //if (totalPercentOffset != 0) {
                        //    data[maxPercentageOffsetIndex].percentage += +totalPercentOffset;
                        //    data[maxPercentageOffsetIndex].percentage = parseFloat(data[maxPercentageOffsetIndex].percentage).toFixed(percentFixedNum);
                        //    data[maxPercentageOffsetIndex].txt = parseFloat(data[maxPercentageOffsetIndex].percentage).toFixed(percentFixedNum) + '%';
                        //};
                    }
                }
            },
            getList: function () {
                var self = this;
                var list = [];
                if (self.sectors && self.sectors.length > 0) {
                    list = self.sectors;
                }
                ;
                return list;
            },
            getLabelList: function () {
                return this.labelList;
            },
            getTopAndBottomIndex: function () {
                var me = this;
                var data = self.data;
                var indexs = {};
                var topBase = 270;
                var bottomBase = 90;
                var preTopDis = 90,
                    preBottomDis = 90,
                    currentTopDis, currentBottomDis;
                if (data.length > 0) {
                    _.each(self.data, function () {
                        //bottom
                        if (data.quadrant == 1 || data.quadrant == 2) {
                            currentBottomDis = Math.abs(data.middleAngle - bottomBase);
                            if (currentBottomDis < preBottomDis) {
                                indexs.bottomIndex = data.index;
                                preBottomDis = currentBottomDis;
                            }
                        }
                        //top
                        else if (data.quadrant == 3 || data.quadrant == 4) {
                            currentTopDis = Math.abs(data.middleAngle - topBase);
                            if (currentTopDis < preTopDis) {
                                indexs.topIndex = data.index;
                                preTopDis = currentTopDis;
                            }
                        }
                    })
                }
                return indexs;
            },
            getColorByIndex: function (colors, index) {
                if (index >= colors.length) {
                    //若数据条数刚好比颜色数组长度大1,会导致最后一个扇形颜色与第一个颜色重复
                    if ((this.data.data.length - 1) % colors.length == 0 && (index % colors.length == 0)) {
                        index = index % colors.length + 1;
                    } else {
                        index = index % colors.length;
                    }
                }
                ;
                return colors[index];
            },
            _configColors: function () {
                this.colors = this.colors ? this.colors : Theme.colors;
            },
            draw: function (opt) {
                var self = this;
                self.setX(self.x);
                self.setY(self.y);
                self._widget();


                //this.sprite.context.globalAlpha = 0;
                if (opt.animation) {
                    self.grow();
                }
                if (opt.complete) {
                    opt.complete.call(self);
                }
            },
            getOneSector: function (index) {
                var self = this;
                var allFace = self.sprite.getChildById("allFace");
                var everyFace = {};
                _.each(_attrs, function (name) {
                    everyFace[name] = allFace.getChildById('path_' + name + '_' + index);
                });
                return everyFace;
            },
            focus: function (index, callback) {
                var self = this;
                var sec = self.sectorMap[index].sector;
                var _everyFace = self.getOneSector(index);
                var secData = self.data.data[index];
                secData._selected = true;
                sec.animate({
                    x: secData.outOffsetx,
                    y: secData.outOffsety
                }, {
                    duration: 100,
                    onUpdate: function (a) {
                        _.each(_attrs, function (name) {
                            _everyFace[name].context.x = a.x;
                            _everyFace[name].context.y = a.y;

                        });

                    },
                    onComplete: function () {
                        //secData.checked = true;
                        callback && callback();
                    }
                });
            },
            unfocus: function (index, callback) {
                var self = this;
                var sec = self.sectorMap[index].sector;
                var _everyFace = self.getOneSector(index);

                var secData = self.data.data[index];
                secData._selected = false;
                sec.animate({
                    x: 0,
                    y: 0
                }, {
                    duration: 100,
                    onUpdate: function (a) {
                        _.each(_attrs, function (name) {
                            _everyFace[name].context.x = a.x;
                            _everyFace[name].context.y = a.y;

                        });
                    },
                    onComplete: function () {
                        callback && callback();
                        //secData.checked = false;
                    }
                });
            },
            check: function (index) {
                var sec = this.sectorMap[index].sector;
                var secData = this.data.data[index];
                if (secData.checked) {
                    return;
                }

                var me = this;
                if (!secData._selected) {
                    this.focus(index, function () {
                        me.addCheckedSec(sec);
                    });
                } else {
                    this.addCheckedSec(sec);
                }

                secData.checked = true;
            },
            uncheck: function (index) {
                var sec = this.sectorMap[index].sector;
                var secData = this.data.data[index];
                if (!secData.checked) {
                    return
                }
                ;
                var me = this;
                me.cancelCheckedSec(sec, function () {
                    me.unfocus(index);
                });
                secData.checked = false;
            },
            uncheckAll: function () {
                var me = this;
                _.each(this.sectorMap, function (sm, i) {
                    var sec = sm.sector;
                    var secData = me.data.data[i];
                    if (secData.checked) {
                        me.cancelCheckedSec(sec);
                        secData.checked = false;
                    }
                });
            },
            grow: function () {
                var self = this;
                var timer = null;
                var _context = null;

                _.each(self.sectors, function (sec, index) {

                    sec.startAngleForAnimation= self.angleOffset;
                    sec.endAngleForAnimation= self.angleOffset;

                    _.each(self.getOneSector(index), function (face) {
                        if (_context = face.context) {
                            _context.path = 'M 0,0';
                        }
                    });
                });


                self._hideDataLabel();

                AnimationFrame.registTween({
                    from: {
                        process: 0,
                        r: 0,
                        r0: 0
                    },
                    to: {
                        process: 1,
                        r: self.r,
                        r0: self.r0
                    },
                    duration: 500,
                    //easing: "Back.In",
                    onUpdate: function () {
                        for (var i = 0; i < self.sectors.length; i++) {
                            var sec = self.sectors[i];
                            if (i == 0) {
                                sec.startAngleForAnimation = sec.startAngle;
                                sec.endAngleForAnimation = sec.startAngle + (sec.endAngle - sec.startAngle) * this.process;
                            } else {
                                var lastEndAngle = function (index) {
                                    var lastIndex = index - 1;
                                    var lastSecc = self.sectors[lastIndex];
                                    if (lastIndex == 0) {
                                        return lastSecc ? lastSecc.endAngleForAnimation : 0;
                                    }
                                    if (lastSecc) {
                                        return lastSecc.endAngleForAnimation;
                                    } else {
                                        return arguments.callee(lastIndex);
                                    }
                                }(i);

                                sec.startAngleForAnimation = lastEndAngle;
                                sec.endAngleForAnimation = sec.startAngleForAnimation  + (sec.endAngle - sec.startAngle) * this.process;

                            }


                            var _SVGPaths = self.setPaths({
                                alpha: deg2rad * self.rotation.x,  //0.7853981633974483,
                                beta: deg2rad * self.rotation.y,
                                depth: self.thickness,  // 26.25,
                                end: deg2rad * (sec.startAngleForAnimation + 360) - 0.0001,
                                innerR: this.r0,
                                r: this.r,
                                start: deg2rad * (sec.endAngleForAnimation + 360) + 0.0001,
                                x: 0,
                                y: 0
                            });


                            var _process = this.process;
                            _.each(self.getOneSector(i), function (face) {
                                if (_context = face.context) {
                                    _context.globalAlpha = self.globalAlpha || _process;
                                    var _key = face.id.split('_')[1];
                                    _context.path = _SVGPaths[_key];
                                }
                            });

                        }
                    },
                    onComplete: function () {
                        self._showDataLabel();
                    }
                });
            },
            _showDataLabel: function () {
                if (this.branchSp) {
                    this.branchSp.context.globalAlpha = 1;
                    _.each(this.labelList, function (lab) {
                        lab.labelEle.style.display = "block"
                    });
                }
            },
            _hideDataLabel: function () {
                if (this.branchSp) {
                    this.branchSp.context.globalAlpha = 0;
                    _.each(this.labelList, function (lab) {
                        lab.labelEle.style.display = "none"
                    });
                }
            },
            _showTip: function (e, ind) {
                this._tip.show(this._geteventInfo(e, ind));
            },
            _hideTip: function (e) {
                this._tip.hide(e);
            },
            _moveTip: function (e, ind) {
                this._tip.move(this._geteventInfo(e, ind))
            },
            _getTipDefaultContent: function (info) {
                return "<div style='color:" + info.fillStyle + "'><div style='padding-bottom:3px;'>" + info.name + "：" + info.value + "</div>" + parseInt(info.percentage) + "%</div>";
            },
            _geteventInfo: function (e, ind) {

                var data = this.data.data[ind];
                var fillColor = this.getColorByIndex(this.colors, ind);
                e.eventInfo = {
                    iNode: ind,
                    name: data.name,
                    percentage: data.percentage,
                    value: data.y,
                    fillStyle: fillColor,
                    data: this.data.data[ind],
                    checked: data.checked
                };
                return e;
            },
            _sectorFocus: function (e, index) {
                if (this.sectorMap[index]) {
                    if (this.focusCallback && e) {
                        this.focusCallback.focus(e, index);
                    }
                }
            },
            _sectorUnfocus: function (e, index) {
                if (this.focusCallback && e) {
                    this.focusCallback.unfocus(e, index);
                }
            },
            _getByIndex: function (index) {
                return this.sectorMap[index];
            },
            _widgetLabel: function (quadrant, indexs, lmin, rmin, isEnd, ySpaceInfo) {
                var self = this;
                var count = 0;
                var data = self.data.data;
                var sectorMap = self.sectorMap;
                var minTxtDis = 15;
                var labelOffsetX = 5;
                var outCircleRadius = self.r + 2 * self.clickMoveDis;
                var currentIndex, baseY, clockwise, isleft, minPercent;
                var currentY, adjustX, txtDis, bkLineStartPoint, bklineMidPoint, bklineEndPoint, branchLine, brokenline, branchTxt, bwidth, bheight, bx, by;
                var isMixed, yBound, remainingNum, remainingY, adjustY;

                clockwise = quadrant == 2 || quadrant == 4;
                isleft = quadrant == 2 || quadrant == 3;
                isup = quadrant == 3 || quadrant == 4;
                minY = isleft ? lmin : rmin;

                //label的绘制顺序做修正，label的Y值在饼图上半部分（isup）时，Y值越小的先画，反之Y值在饼图下部分时，Y值越大的先画.
                if (indexs.length > 0) {
                    indexs.sort(function (a, b) {
                        return isup ? data[a].edgey - data[b].edgey : data[b].edgey - data[a].edgey;
                    })
                }

                for (i = 0; i < indexs.length; i++) {
                    currentIndex = indexs[i];
                    //若Y值小于最小值，不画label    
                    if (data[currentIndex].ignored || data[currentIndex].y < minY || count >= self.labelMaxCount) continue
                    count++;
                    currentY = data[currentIndex].edgey;
                    adjustX = Math.abs(data[currentIndex].edgex);
                    txtDis = currentY - baseY;

                    if (i != 0 && ((Math.abs(txtDis) < minTxtDis) || (isup && txtDis < 0) || (!isup && txtDis > 0))) {
                        currentY = isup ? baseY + minTxtDis : baseY - minTxtDis;
                        if (outCircleRadius - Math.abs(currentY) > 0) {
                            adjustX = Math.sqrt(Math.pow(outCircleRadius, 2) - Math.pow(currentY, 2));
                        }

                        if ((isleft && (-adjustX > data[currentIndex].edgex)) || (!isleft && (adjustX < data[currentIndex].edgex))) {
                            adjustX = Math.abs(data[currentIndex].edgex);
                        }
                    }

                    if (isEnd) {
                        yBound = isleft ? ySpaceInfo.left : ySpaceInfo.right;
                        remainingNum = indexs.length - i;
                        remainingY = isup ? yBound - remainingNum * minTxtDis : yBound + remainingNum * minTxtDis;
                        if ((isup && currentY > remainingY) || !isup && currentY < remainingY) {
                            currentY = remainingY;
                        }
                    }

                    bkLineStartPoint = [data[currentIndex].outx, data[currentIndex].outy];
                    bklineMidPoint = [isleft ? -adjustX : adjustX, currentY];
                    bklineEndPoint = [isleft ? -adjustX - labelOffsetX : adjustX + labelOffsetX, currentY];
                    baseY = currentY;
                    if (!isEnd) {
                        if (isleft) {
                            ySpaceInfo.left = baseY;
                        } else {
                            ySpaceInfo.right = baseY;
                        }
                    }
                    //指示线
                    branchLine = new Line({
                        context: {
                            xStart: data[currentIndex].centerx,
                            yStart: data[currentIndex].centery,
                            xEnd: data[currentIndex].outx,
                            yEnd: data[currentIndex].outy,
                            lineWidth: 1,
                            strokeStyle: sectorMap[currentIndex].color,
                            lineType: 'solid'
                        }
                    });
                    brokenline = new BrokenLine({
                        context: {
                            lineType: 'solid',
                            smooth: false,
                            pointList: [bkLineStartPoint, bklineMidPoint, bklineEndPoint],
                            lineWidth: 1,
                            strokeStyle: sectorMap[currentIndex].color
                        }
                    });
                    //指示文字
                    var labelTxt = '';
                    var formatReg = /\{.+?\}/g;
                    var point = data[currentIndex];
                    if (self.dataLabel.format) {
                        if (_.isFunction(self.dataLabel.format)) {
                            labelTxt = this.dataLabel.format(data[currentIndex]);
                        } else {
                            labelTxt = self.dataLabel.format.replace(formatReg, function (match, index) {
                                var matchStr = match.replace(/\{([\s\S]+?)\}/g, '$1');
                                var vals = matchStr.split('.');
                                var obj = eval(vals[0]);
                                var pro = vals[1];
                                return obj[pro];
                            });
                            if (labelTxt) {
                                labelTxt = "<span>" + labelTxt + "</span>"
                            }
                            ;
                        }
                    }
                    ;
                    labelTxt || (labelTxt = "<span>" + data[currentIndex].name + ' : ' + data[currentIndex].txt + "</span>");

                    branchTxt = document.createElement("div");
                    branchTxt.style.cssText = " ;position:absolute;left:-1000px;top:-1000px;color:" + sectorMap[currentIndex].color + ""
                    branchTxt.innerHTML = labelTxt;
                    self.domContainer.appendChild(branchTxt);
                    bwidth = branchTxt.offsetWidth;
                    bheight = branchTxt.offsetHeight;

                    this.branchTxt = branchTxt
                    //branchTxt.style.display = "none"

                    bx = isleft ? -adjustX : adjustX;
                    by = currentY;

                    switch (quadrant) {
                        case 1:
                            bx += labelOffsetX;
                            by -= bheight / 2;
                            break;
                        case 2:
                            bx -= (bwidth + labelOffsetX);
                            by -= bheight / 2;
                            break;
                        case 3:
                            bx -= (bwidth + labelOffsetX);
                            by -= bheight / 2;
                            break;
                        case 4:
                            bx += labelOffsetX;
                            by -= bheight / 2;
                            break;
                    }
                    ;

                    //branchTxt.context.x = bx;
                    //branchTxt.context.y = by;

                    branchTxt.style.left = bx + self.x + "px";
                    branchTxt.style.top = by + self.y + "px";

                    if (self.dataLabel.allowLine) {
                        self.branchSp.addChild(branchLine);
                        self.branchSp.addChild(brokenline);
                    }
                    ;

                    self.sectorMap[currentIndex].label = {
                        line1: branchLine,
                        line2: brokenline,
                        label: branchTxt
                    };

                    self.labelList.push({
                        width: bwidth,
                        height: bheight,
                        x: bx + self.x,
                        y: by + self.y,
                        data: data[currentIndex],
                        labelTxt: labelTxt,
                        labelEle: branchTxt
                    });

                }
            },
            _hideLabel: function (index) {
                if (this.sectorMap[index]) {
                    var label = this.sectorMap[index].label;
                    label.line1.context.visible = false;
                    label.line2.context.visible = false;
                    label.label.style.display = "none";
                }
            },
            _showLabel: function (index) {
                if (this.sectorMap[index]) {
                    var label = this.sectorMap[index].label;
                    label.line1.context.visible = true;
                    label.line2.context.visible = true;
                    label.label.style.display = "block";
                }
            },
            _startWidgetLabel: function () {
                var self = this;
                var data = self.data.data;
                var rMinPercentage = 0,
                    lMinPercentage = 0,
                    rMinY = 0,
                    lMinY = 0;
                var quadrantsOrder = [];
                var quadrantInfo = [{
                    indexs: [],
                    count: 0
                }, {
                    indexs: [],
                    count: 0
                }, {
                    indexs: [],
                    count: 0
                }, {
                    indexs: [],
                    count: 0
                }];
                //默认从top开始画
                var widgetInfo = {
                    right: {
                        startQuadrant: 4,
                        endQuadrant: 1,
                        clockwise: true,
                        indexs: []
                    },
                    left: {
                        startQuadrant: 3,
                        endQuadrant: 2,
                        clockwise: false,
                        indexs: []
                    }
                }
                for (var i = 0; i < data.length; i++) {
                    var cur = data[i].quadrant;
                    quadrantInfo[cur - 1].indexs.push(i);
                    quadrantInfo[cur - 1].count++;
                }

                //1,3象限的绘制顺序需要反转
                if (quadrantInfo[0].count > 1) quadrantInfo[0].indexs.reverse();
                if (quadrantInfo[2].count > 1) quadrantInfo[2].indexs.reverse();

                if (quadrantInfo[0].count > quadrantInfo[3].count) {
                    widgetInfo.right.startQuadrant = 1;
                    widgetInfo.right.endQuadrant = 4;
                    widgetInfo.right.clockwise = false;
                }

                if (quadrantInfo[1].count > quadrantInfo[2].count) {
                    widgetInfo.left.startQuadrant = 2;
                    widgetInfo.left.endQuadrant = 3;
                    widgetInfo.left.clockwise = true;
                }

                widgetInfo.right.indexs = quadrantInfo[widgetInfo.right.startQuadrant - 1].indexs.concat(quadrantInfo[widgetInfo.right.endQuadrant - 1].indexs);
                widgetInfo.left.indexs = quadrantInfo[widgetInfo.left.startQuadrant - 1].indexs.concat(quadrantInfo[widgetInfo.left.endQuadrant - 1].indexs);

                var overflowIndexs, sortedIndexs;

                if (widgetInfo.right.indexs.length > self.labelMaxCount) {
                    sortedIndexs = widgetInfo.right.indexs.slice(0);
                    sortedIndexs.sort(function (a, b) {
                        return data[b].y - data[a].y;
                    });
                    overflowIndexs = sortedIndexs.slice(self.labelMaxCount);
                    rMinPercentage = data[overflowIndexs[0]].percentage;
                    rMinY = data[overflowIndexs[0]].y;
                }
                if (widgetInfo.left.indexs.length > self.labelMaxCount) {
                    sortedIndexs = widgetInfo.left.indexs.slice(0);
                    sortedIndexs.sort(function (a, b) {
                        return data[b].y - data[a].y;
                    });
                    overflowIndexs = sortedIndexs.slice(self.labelMaxCount);
                    lMinPercentage = data[overflowIndexs[0]].percentage;
                    lMinY = data[overflowIndexs[0]].y;
                }

                quadrantsOrder.push(widgetInfo.right.startQuadrant);
                quadrantsOrder.push(widgetInfo.right.endQuadrant);
                quadrantsOrder.push(widgetInfo.left.startQuadrant);
                quadrantsOrder.push(widgetInfo.left.endQuadrant);

                var ySpaceInfo = {}

                for (i = 0; i < quadrantsOrder.length; i++) {
                    var isEnd = i == 1 || i == 3;
                    self._widgetLabel(quadrantsOrder[i], quadrantInfo[quadrantsOrder[i] - 1].indexs, lMinY, rMinY, isEnd, ySpaceInfo)
                }
            },
            _getAngleTime: function (secc) {
                return Math.abs(secc.startAngle - secc.endAngle) / 360 * 500
            },
            addCheckedSec: function (sec, callback) {

                var secc = sec.context;
                var sector = new Sector({
                    context: {
                        x: secc.x,
                        y: secc.y,
                        r0: secc.r,
                        r: secc.r + 8,
                        startAngle: secc.startAngle,
                        endAngle: secc.startAngle + 0.5, //secc.endAngle,
                        fillStyle: secc.fillStyle,
                    },
                    id: 'checked_' + sec.id
                });
                this.checkedSp.addChild(sector);
                sector.animate({
                    endAngle: secc.endAngle
                }, {
                    duration: this._getAngleTime(secc),
                    onComplete: function () {
                        callback && callback();
                    }
                });
            },
            cancelCheckedSec: function (sec, callback) {
                var checkedSec = this.checkedSp.getChildById('checked_' + sec.id);
                checkedSec.animate({
                    //endAngle : checkedSec.context.startAngle+0.5
                    startAngle: checkedSec.context.endAngle - 0.3
                }, {
                    onComplete: function () {
                        checkedSec.destroy();
                        callback && callback();
                    },
                    duration: 150
                });
            },
            _widget: function () {
                var self = this;
                var data = self.data.data;
                var moreSecData;
                var sectorsSp3d = [];

                self.sprite.removeAllChildren();

                if (data.length > 0 && self.total > 0) {
                    self.branchSp && self.sprite.addChild(self.branchSp);
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].ignored) continue;

                        if (self.colorIndex >= self.colors.length) self.colorIndex = 0;
                        var fillColor = self.getColorByIndex(self.colors, i);
                        var _sideFillStyle = ColorFormat.colorBrightness(fillColor, -0.2);

                        var oneSector = new Canvax.Display.Sprite({
                            id: "sp_sector" + i
                        })

                        //扇形主体


                        var _SVGPaths = self.setPaths({
                            alpha: deg2rad * self.rotation.x,  //0.7853981633974483,
                            beta: deg2rad * self.rotation.y,
                            depth: self.thickness,  // 26.25,
                            end: deg2rad * (data[i].end + 360) - 0.0001,
                            innerR: self.r0,
                            r: self.r,
                            start: deg2rad * (data[i].start + 360) + 0.0001,
                            x: 0,
                            y: 0
                        });


                        _.each(_attrs, function (item) {

                            var _pathObj = new Path({
                                id: "path_" + item + '_' + data[i].index,
                                zIndex: _SVGPaths['z' + item],
                                context: {
                                    x: data[i].sliced ? data[i].outOffsetx : 0,
                                    y: data[i].sliced ? data[i].outOffsety : 0,
                                    path: _SVGPaths[item],
                                    fillStyle: item === 'top' ? fillColor : _sideFillStyle,
                                    index: data[i].index,
                                    cursor: "pointer",
                                    globalAlpha: self.globalAlpha || 1

                                }
                            });

                            oneSector.addChild(_pathObj.clone());

                            sectorsSp3d.push(_pathObj);


                            //var _cloneTopPath = _pathObj.clone();
                            //_cloneTopPath.id = 'sp_' + item + '_clone_' + data[i].index;
                            //self['sectorsSp3d_' + item].addChild(_cloneTopPath);
                            //
                            if (item === 'top') {
                                _pathObj.__data = data[i];
                                _pathObj.__colorIndex = i;
                                _pathObj.__dataIndex = i;
                                _pathObj.__isSliced = data[i].sliced;

                                //扇形事件
                                _pathObj.hover(function (e) {
                                    if (self.tips.enabled) {
                                        self._showTip(e, this.__dataIndex);
                                    }
                                    var secData = self.data.data[this.__dataIndex];
                                    if (!secData.checked) {
                                        self._sectorFocus(e, this.__dataIndex);
                                        self.focus(this.__dataIndex);
                                    }
                                }, function (e) {
                                    if (self.tips.enabled) {
                                        self._hideTip(e);
                                    }
                                    var secData = self.data.data[this.__dataIndex];
                                    if (!secData.checked) {
                                        self._sectorUnfocus(e, this.__dataIndex);
                                        self.unfocus(this.__dataIndex);
                                    }
                                });

                                _pathObj.on('mousedown mouseup click mousemove dblclick', function (e) {
                                    self._geteventInfo(e, this.__dataIndex);
                                    if (e.type == "click") {
                                        self.secClick(this, e);
                                    }
                                    ;
                                    if (e.type == "mousemove") {
                                        if (self.tips.enabled) {
                                            self._moveTip(e, this.__dataIndex);
                                        }
                                    }
                                });


                            }

                        });


                        moreSecData = {
                            name: data[i].name,
                            value: data[i].y,
                            sector: oneSector,
                            r: self.r,
                            startAngle: data[i].start,
                            endAngle: data[i].end,
                            color: fillColor,
                            index: i,
                            percentage: data[i].percentage,
                            visible: true
                        };

                        self.sectors.push(moreSecData);

                    }
                    sectorsSp3d.sort(function (a, b) {
                        return a.zIndex < b.zIndex ? -1 : 1;
                    });

                    var allFaceSprite = new Canvax.Display.Sprite({
                        id: 'allFace'
                    });

                    for (var t = 0, len = sectorsSp3d.length; t < len; t++) {
                        allFaceSprite.addChild(sectorsSp3d[t]);
                    }


                    self.sprite.addChild(allFaceSprite);

                    if (self.sectors.length > 0) {
                        self.sectorMap = {};
                        for (var i = 0; i < self.sectors.length; i++) {
                            self.sectorMap[self.sectors[i].index] = self.sectors[i];
                        }

                        //self.sprite.addChild(self.sectorsSp);
                    }

                    if (self.dataLabel.enabled) {
                        self._startWidgetLabel();
                    }


                    if (self.animation) {
                        _.each(allFaceSprite.children, function (face) {
                            face.context.globalAlpha = 0;
                        });
                    }

                }
            },
            secClick: function (sectorEl, e) {
                if (!this.checked.enabled) return;
                var secData = this.data.data[sectorEl.__dataIndex];
                //if (sectorEl.clickIng) {
                //    return;
                //}
                //;
                //sectorEl.clickIng = true;
                if (!secData.checked) {
                    this.addCheckedSec(sectorEl, function () {
                        sectorEl.clickIng = false;
                    });
                } else {
                    this.cancelCheckedSec(sectorEl, function () {
                        sectorEl.clickIng = false;
                    });
                }
                ;
                secData.checked = !secData.checked;
                e.eventInfo.checked = secData.checked;
            },
            arc3dPath: function (shapeArgs) {
                var cx = shapeArgs.x, // x coordinate of the center
                    cy = shapeArgs.y, // y coordinate of the center
                    start = shapeArgs.start, // start angle
                    end = shapeArgs.end - 0.00001, // end angle
                    r = shapeArgs.r, // radius
                    ir = shapeArgs.innerR, // inner radius
                    d = shapeArgs.depth, // depth
                    alpha = shapeArgs.alpha, // alpha rotation of the chart
                    beta = shapeArgs.beta; // beta rotation of the chart

                // Derived Variables
                var cs = cos(start),        // cosinus of the start angle
                    ss = sin(start),        // sinus of the start angle
                    ce = cos(end),            // cosinus of the end angle
                    se = sin(end),            // sinus of the end angle
                    rx = r * cos(beta),        // x-radius
                    ry = r * cos(alpha),    // y-radius
                    irx = ir * cos(beta),    // x-radius (inner)
                    iry = ir * cos(alpha),    // y-radius (inner)
                    dx = d * sin(beta),        // distance between top and bottom in x
                    dy = d * sin(alpha);    // distance between top and bottom in y

                // TOP
                var top = ['M', cx + (rx * cs), cy + (ry * ss)];
                top = top.concat(curveTo(cx, cy, rx, ry, start, end, 0, 0));
                top = top.concat([
                    'L', cx + (irx * ce), cy + (iry * se)
                ]);
                top = top.concat(curveTo(cx, cy, irx, iry, end, start, 0, 0));
                top = top.concat(['Z']);
                // OUTSIDE
                var b = (beta > 0 ? PI / 2 : 0),
                    a = (alpha > 0 ? 0 : PI / 2);

                var start2 = start > -b ? start : (end > -b ? -b : start),
                    end2 = end < PI - a ? end : (start < PI - a ? PI - a : end),
                    midEnd = 2 * PI - a;

                // When slice goes over bottom middle, need to add both, left and right outer side.
                // Additionally, when we cross right hand edge, create sharp edge. Outer shape/wall:
                //
                //            -------
                //          /    ^    \
                //    4)   /   /   \   \  1)
                //        /   /     \   \
                //       /   /       \   \
                // (c)=> ====         ==== <=(d)
                //       \   \       /   /
                //        \   \<=(a)/   /
                //         \   \   /   / <=(b)
                //    3)    \    v    /  2)
                //            -------
                //
                // (a) - inner side
                // (b) - outer side
                // (c) - left edge (sharp)
                // (d) - right edge (sharp)
                // 1..n - rendering order for startAngle = 0, when set to e.g 90, order changes clockwise (1->2, 2->3, n->1) and counterclockwise for negative startAngle

                var out = ['M', cx + (rx * cos(start2)), cy + (ry * sin(start2))];
                out = out.concat(curveTo(cx, cy, rx, ry, start2, end2, 0, 0));

                //if (end > midEnd && start < midEnd) { // When shape is wide, it can cross both, (c) and (d) edges, when using startAngle
                //    // Go to outer side
                //    out = out.concat([
                //        'L', cx + (rx * cos(end2)) + dx, cy + (ry * sin(end2)) + dy
                //    ]);
                //    // Curve to the right edge of the slice (d)
                //    out = out.concat(curveTo(cx, cy, rx, ry, end2, midEnd, dx, dy));
                //    // Go to the inner side
                //    out = out.concat([
                //        'L', cx + (rx * cos(midEnd)), cy + (ry * sin(midEnd))
                //    ]);
                //    // Curve to the true end of the slice
                //    out = out.concat(curveTo(cx, cy, rx, ry, midEnd, end, 0, 0));
                //    // Go to the outer side
                //    out = out.concat([
                //        'L', cx + (rx * cos(end)) + dx, cy + (ry * sin(end)) + dy
                //    ]);
                //    // Go back to middle (d)
                //    out = out.concat(curveTo(cx, cy, rx, ry, end, midEnd, dx, dy));
                //    out = out.concat([
                //        'L', cx + (rx * cos(midEnd)), cy + (ry * sin(midEnd))
                //    ]);
                //    // Go back to the left edge
                //    out = out.concat(curveTo(cx, cy, rx, ry, midEnd, end2, 0, 0));
                //} else if (end > PI - a && start < PI - a) { // But shape can cross also only (c) edge:
                //    // Go to outer side
                //    out = out.concat([
                //        'L', cx + (rx * cos(end2)) + dx, cy + (ry * sin(end2)) + dy
                //    ]);
                //    // Curve to the true end of the slice
                //    out = out.concat(curveTo(cx, cy, rx, ry, end2, end, dx, dy));
                //    // Go to the inner side
                //    out = out.concat([
                //        'L', cx + (rx * cos(end)), cy + (ry * sin(end))
                //    ]);
                //    // Go back to the artifical end2
                //    out = out.concat(curveTo(cx, cy, rx, ry, end, end2, 0, 0));
                //}

                out = out.concat([
                    'L', cx + (rx * cos(end2)) + dx, cy + (ry * sin(end2)) + dy
                ]);
                out = out.concat(curveTo(cx, cy, rx, ry, end2, start2, dx, dy));
                out = out.concat(['Z']);

                // INSIDE
                var inn = ['M', cx + (irx * cs), cy + (iry * ss)];
                inn = inn.concat(curveTo(cx, cy, irx, iry, start, end, 0, 0));
                inn = inn.concat([
                    'L', cx + (irx * cos(end)) + dx, cy + (iry * sin(end)) + dy
                ]);
                inn = inn.concat(curveTo(cx, cy, irx, iry, end, start, dx, dy));
                inn = inn.concat(['Z']);

                // SIDES
                var side1 = [
                    'M', cx + (rx * cs), cy + (ry * ss),
                    'L', cx + (rx * cs) + dx, cy + (ry * ss) + dy,
                    'L', cx + (irx * cs) + dx, cy + (iry * ss) + dy,
                    'L', cx + (irx * cs), cy + (iry * ss),
                    'Z'
                ];
                var side2 = [
                    'M', cx + (rx * ce), cy + (ry * se),
                    'L', cx + (rx * ce) + dx, cy + (ry * se) + dy,
                    'L', cx + (irx * ce) + dx, cy + (iry * se) + dy,
                    'L', cx + (irx * ce), cy + (iry * se),
                    'Z'
                ];

                // correction for changed position of vanishing point caused by alpha and beta rotations
                var angleCorr = Math.atan2(dy, -dx),
                    angleEnd = Math.abs(end + angleCorr),
                    angleStart = Math.abs(start + angleCorr),
                    angleMid = Math.abs((start + end) / 2 + angleCorr);


                // set to 0-PI range
                function toZeroPIRange(angle) {
                    angle = angle % (2 * PI);
                    if (angle > PI) {
                        angle = 2 * PI - angle;
                    }
                    return angle;
                }


                angleEnd = toZeroPIRange(angleEnd);
                angleStart = toZeroPIRange(angleStart);
                angleMid = toZeroPIRange(angleMid);


                // *1e5 is to compensate pInt in zIndexSetter
                var incPrecision = 1e5,
                    a1 = angleMid * incPrecision,
                    a2 = angleStart * incPrecision,
                    a3 = angleEnd * incPrecision;


                var value = {
                    top: top,
                    ztop: PI * incPrecision + 1, // max angle is PI, so this is allways higher
                    out: out,
                    zout: Math.max(a1, a2, a3),
                    inn: inn,
                    zinn: Math.max(a1, a2, a3),
                    side1: side1,
                    zside1: a2 * 0.99, // to keep below zOut and zInn in case of same values
                    side2: side2,
                    zside2: a3 * 0.99
                };

                // console.log(value)

                return value;
            },
            arrayToPath: function (arrPath) {
                var _path = arrPath.join(',').replace(/([0-9a-zA-Z.]+)(\,)([0-9a-zA-Z.]+)/ig, function ($1, $2, $3, $4) {
                    if ((/[a-zA-Z]/.test($2) && /[0-9.]+/.test($4)) || (/[0-9.]+/.test($2) && /[a-zA-Z]/.test($4))) {
                        return $2 + $4;
                    } else {
                        return $1;
                    }
                });
                return _path;
            },
            setPaths: function (attribs) {
                var me = this;

                //console.log(JSON.stringify(attribs));
                var _paths = me.arc3dPath(attribs);
                var _SVGPaths = {};
                _.extend(_SVGPaths, _paths);
                _.each(_attrs, function (item) {
                    _SVGPaths[item] = me.arrayToPath(_paths[item]);
                });

                return _SVGPaths;

            }
        };

        return Pie;
    })