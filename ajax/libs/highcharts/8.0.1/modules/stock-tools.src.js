/**
 * @license Highstock JS v8.0.1 (2020-03-02)
 *
 * Advanced Highstock tools
 *
 * (c) 2010-2019 Highsoft AS
 * Author: Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/modules/stock-tools', ['highcharts', 'highcharts/modules/stock'], function (Highcharts) {
            factory(Highcharts);
            factory.Highcharts = Highcharts;
            return factory;
        });
    } else {
        factory(typeof Highcharts !== 'undefined' ? Highcharts : undefined);
    }
}(function (Highcharts) {
    var _modules = Highcharts ? Highcharts._modules : {};
    function _registerModule(obj, path, args, fn) {
        if (!obj.hasOwnProperty(path)) {
            obj[path] = fn.apply(null, args);
        }
    }
    _registerModule(_modules, 'modules/stock-tools-bindings.js', [_modules['parts/Globals.js'], _modules['parts/Utilities.js']], function (H, U) {
        /**
         *
         *  Events generator for Stock tools
         *
         *  (c) 2009-2020 Paweł Fus
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var correctFloat = U.correctFloat,
            defined = U.defined,
            extend = U.extend,
            isNumber = U.isNumber,
            merge = U.merge,
            pick = U.pick,
            uniqueKey = U.uniqueKey;
        var fireEvent = H.fireEvent,
            bindingsUtils = H.NavigationBindings.prototype.utils,
            PREFIX = 'highcharts-';
        /* eslint-disable no-invalid-this, valid-jsdoc */
        /**
         * Generates function which will add a flag series using modal in GUI.
         * Method fires an event "showPopup" with config:
         * `{type, options, callback}`.
         *
         * Example: NavigationBindings.utils.addFlagFromForm('url(...)') - will
         * generate function that shows modal in GUI.
         *
         * @private
         * @function bindingsUtils.addFlagFromForm
         *
         * @param {Highcharts.FlagsShapeValue} type
         *        Type of flag series, e.g. "squarepin"
         *
         * @return {Function}
         *         Callback to be used in `start` callback
         */
        bindingsUtils.addFlagFromForm = function (type) {
            return function (e) {
                var navigation = this,
                    chart = navigation.chart,
                    toolbar = chart.stockTools,
                    getFieldType = bindingsUtils.getFieldType,
                    point = bindingsUtils.attractToPoint(e,
                    chart),
                    pointConfig = {
                        x: point.x,
                        y: point.y
                    },
                    seriesOptions = {
                        type: 'flags',
                        onSeries: point.series.id,
                        shape: type,
                        data: [pointConfig],
                        point: {
                            events: {
                                click: function () {
                                    var point = this,
                    options = point.options;
                                fireEvent(navigation, 'showPopup', {
                                    point: point,
                                    formType: 'annotation-toolbar',
                                    options: {
                                        langKey: 'flags',
                                        type: 'flags',
                                        title: [
                                            options.title,
                                            getFieldType(options.title)
                                        ],
                                        name: [
                                            options.name,
                                            getFieldType(options.name)
                                        ]
                                    },
                                    onSubmit: function (updated) {
                                        if (updated.actionType === 'remove') {
                                            point.remove();
                                        }
                                        else {
                                            point.update(navigation.fieldsToOptions(updated.fields, {}));
                                        }
                                    }
                                });
                            }
                        }
                    }
                };
                if (!toolbar || !toolbar.guiEnabled) {
                    chart.addSeries(seriesOptions);
                }
                fireEvent(navigation, 'showPopup', {
                    formType: 'flag',
                    // Enabled options:
                    options: {
                        langKey: 'flags',
                        type: 'flags',
                        title: ['A', getFieldType('A')],
                        name: ['Flag A', getFieldType('Flag A')]
                    },
                    // Callback on submit:
                    onSubmit: function (data) {
                        navigation.fieldsToOptions(data.fields, seriesOptions.data[0]);
                        chart.addSeries(seriesOptions);
                    }
                });
            };
        };
        bindingsUtils.manageIndicators = function (data) {
            var navigation = this,
                chart = navigation.chart,
                seriesConfig = {
                    linkedTo: data.linkedTo,
                    type: data.type
                },
                indicatorsWithVolume = [
                    'ad',
                    'cmf',
                    'mfi',
                    'vbp',
                    'vwap'
                ],
                indicatorsWithAxes = [
                    'ad',
                    'atr',
                    'cci',
                    'cmf',
                    'macd',
                    'mfi',
                    'roc',
                    'rsi',
                    'ao',
                    'aroon',
                    'aroonoscillator',
                    'trix',
                    'apo',
                    'dpo',
                    'ppo',
                    'natr',
                    'williamsr',
                    'stochastic',
                    'slowstochastic',
                    'linearRegression',
                    'linearRegressionSlope',
                    'linearRegressionIntercept',
                    'linearRegressionAngle'
                ],
                yAxis,
                series;
            if (data.actionType === 'edit') {
                navigation.fieldsToOptions(data.fields, seriesConfig);
                series = chart.get(data.seriesId);
                if (series) {
                    series.update(seriesConfig, false);
                }
            }
            else if (data.actionType === 'remove') {
                series = chart.get(data.seriesId);
                if (series) {
                    yAxis = series.yAxis;
                    if (series.linkedSeries) {
                        series.linkedSeries.forEach(function (linkedSeries) {
                            linkedSeries.remove(false);
                        });
                    }
                    series.remove(false);
                    if (indicatorsWithAxes.indexOf(series.type) >= 0) {
                        yAxis.remove(false);
                        navigation.resizeYAxes();
                    }
                }
            }
            else {
                seriesConfig.id = uniqueKey();
                navigation.fieldsToOptions(data.fields, seriesConfig);
                if (indicatorsWithAxes.indexOf(data.type) >= 0) {
                    yAxis = chart.addAxis({
                        id: uniqueKey(),
                        offset: 0,
                        opposite: true,
                        title: {
                            text: ''
                        },
                        tickPixelInterval: 40,
                        showLastLabel: false,
                        labels: {
                            align: 'left',
                            y: -2
                        }
                    }, false, false);
                    seriesConfig.yAxis = yAxis.options.id;
                    navigation.resizeYAxes();
                }
                else {
                    seriesConfig.yAxis = chart.get(data.linkedTo).options.yAxis;
                }
                if (indicatorsWithVolume.indexOf(data.type) >= 0) {
                    seriesConfig.params.volumeSeriesID = chart.series.filter(function (series) {
                        return series.options.type === 'column';
                    })[0].options.id;
                }
                chart.addSeries(seriesConfig, false);
            }
            fireEvent(navigation, 'deselectButton', {
                button: navigation.selectedButtonElement
            });
            chart.redraw();
        };
        /**
         * Update height for an annotation. Height is calculated as a difference
         * between last point in `typeOptions` and current position. It's a value,
         * not pixels height.
         *
         * @private
         * @function bindingsUtils.updateHeight
         *
         * @param {Highcharts.PointerEventObject} e
         *        normalized browser event
         *
         * @param {Highcharts.Annotation} annotation
         *        Annotation to be updated
         *
         * @return {void}
         */
        bindingsUtils.updateHeight = function (e, annotation) {
            annotation.update({
                typeOptions: {
                    height: this.chart.pointer.getCoordinates(e).yAxis[0].value -
                        annotation.options.typeOptions.points[1].y
                }
            });
        };
        // @todo
        // Consider using getHoverData(), but always kdTree (columns?)
        bindingsUtils.attractToPoint = function (e, chart) {
            var coords = chart.pointer.getCoordinates(e),
                x = coords.xAxis[0].value,
                y = coords.yAxis[0].value,
                distX = Number.MAX_VALUE,
                closestPoint;
            chart.series.forEach(function (series) {
                series.points.forEach(function (point) {
                    if (point && distX > Math.abs(point.x - x)) {
                        distX = Math.abs(point.x - x);
                        closestPoint = point;
                    }
                });
            });
            return {
                x: closestPoint.x,
                y: closestPoint.y,
                below: y < closestPoint.y,
                series: closestPoint.series,
                xAxis: closestPoint.series.xAxis.index || 0,
                yAxis: closestPoint.series.yAxis.index || 0
            };
        };
        /**
         * Shorthand to check if given yAxis comes from navigator.
         *
         * @private
         * @function bindingsUtils.isNotNavigatorYAxis
         *
         * @param {Highcharts.Axis} axis
         * Axis to check.
         *
         * @return {boolean}
         * True, if axis comes from navigator.
         */
        bindingsUtils.isNotNavigatorYAxis = function (axis) {
            return axis.userOptions.className !== PREFIX + 'navigator-yaxis';
        };
        /**
         * Update each point after specified index, most of the annotations use
         * this. For example crooked line: logic behind updating each point is the
         * same, only index changes when adding an annotation.
         *
         * Example: NavigationBindings.utils.updateNthPoint(1) - will generate
         * function that updates all consecutive points except point with index=0.
         *
         * @private
         * @function bindingsUtils.updateNthPoint
         *
         * @param {number} startIndex
         *        Index from each point should udpated
         *
         * @return {Function}
         *         Callback to be used in steps array
         */
        bindingsUtils.updateNthPoint = function (startIndex) {
            return function (e, annotation) {
                var options = annotation.options.typeOptions,
                    coords = this.chart.pointer.getCoordinates(e),
                    x = coords.xAxis[0].value,
                    y = coords.yAxis[0].value;
                options.points.forEach(function (point, index) {
                    if (index >= startIndex) {
                        point.x = x;
                        point.y = y;
                    }
                });
                annotation.update({
                    typeOptions: {
                        points: options.points
                    }
                });
            };
        };
        // Extends NavigationBindigs to support indicators and resizers:
        extend(H.NavigationBindings.prototype, {
            /* eslint-disable valid-jsdoc */
            /**
             * Get current positions for all yAxes. If new axis does not have position,
             * returned is default height and last available top place.
             *
             * @private
             * @function Highcharts.NavigationBindings#getYAxisPositions
             *
             * @param {Array<Highcharts.Axis>} yAxes
             *        Array of yAxes available in the chart.
             *
             * @param {number} plotHeight
             *        Available height in the chart.
             *
             * @param {number} defaultHeight
             *        Default height in percents.
             *
             * @return {Array}
             *         An array of calculated positions in percentages.
             *         Format: `{top: Number, height: Number}`
             */
            getYAxisPositions: function (yAxes, plotHeight, defaultHeight) {
                var positions,
                    allAxesHeight = 0;
                /** @private */
                function isPercentage(prop) {
                    return defined(prop) && !isNumber(prop) && prop.match('%');
                }
                positions = yAxes.map(function (yAxis) {
                    var height = isPercentage(yAxis.options.height) ?
                            parseFloat(yAxis.options.height) / 100 :
                            yAxis.height / plotHeight,
                        top = isPercentage(yAxis.options.top) ?
                            parseFloat(yAxis.options.top) / 100 :
                            correctFloat(yAxis.top - yAxis.chart.plotTop) / plotHeight;
                    // New yAxis does not contain "height" info yet
                    if (!isNumber(height)) {
                        height = defaultHeight / 100;
                    }
                    allAxesHeight = correctFloat(allAxesHeight + height);
                    return {
                        height: height * 100,
                        top: top * 100
                    };
                });
                positions.allAxesHeight = allAxesHeight;
                return positions;
            },
            /**
             * Get current resize options for each yAxis. Note that each resize is
             * linked to the next axis, except the last one which shouldn't affect
             * axes in the navigator. Because indicator can be removed with it's yAxis
             * in the middle of yAxis array, we need to bind closest yAxes back.
             *
             * @private
             * @function Highcharts.NavigationBindings#getYAxisResizers
             *
             * @param {Array<Highcharts.Axis>} yAxes
             *        Array of yAxes available in the chart
             *
             * @return {Array<object>}
             *         An array of resizer options.
             *         Format: `{enabled: Boolean, controlledAxis: { next: [String]}}`
             */
            getYAxisResizers: function (yAxes) {
                var resizers = [];
                yAxes.forEach(function (_yAxis, index) {
                    var nextYAxis = yAxes[index + 1];
                    // We have next axis, bind them:
                    if (nextYAxis) {
                        resizers[index] = {
                            enabled: true,
                            controlledAxis: {
                                next: [
                                    pick(nextYAxis.options.id, nextYAxis.options.index)
                                ]
                            }
                        };
                    }
                    else {
                        // Remove binding:
                        resizers[index] = {
                            enabled: false
                        };
                    }
                });
                return resizers;
            },
            /**
             * Resize all yAxes (except navigator) to fit the plotting height. Method
             * checks if new axis is added, then shrinks other main axis up to 5 panes.
             * If added is more thatn 5 panes, it rescales all other axes to fit new
             * yAxis.
             *
             * If axis is removed, and we have more than 5 panes, rescales all other
             * axes. If chart has less than 5 panes, first pane receives all extra
             * space.
             *
             * @private
             * @function Highcharts.NavigationBindings#resizeYAxes
             * @param {number} [defaultHeight]
             * Default height for yAxis
             * @return {void}
             */
            resizeYAxes: function (defaultHeight) {
                defaultHeight = defaultHeight || 20; // in %, but as a number
                var chart = this.chart, 
                    // Only non-navigator axes
                    yAxes = chart.yAxis.filter(this.utils.isNotNavigatorYAxis),
                    plotHeight = chart.plotHeight,
                    allAxesLength = yAxes.length, 
                    // Gather current heights (in %)
                    positions = this.getYAxisPositions(yAxes,
                    plotHeight,
                    defaultHeight),
                    resizers = this.getYAxisResizers(yAxes),
                    allAxesHeight = positions.allAxesHeight,
                    changedSpace = defaultHeight;
                // More than 100%
                if (allAxesHeight > 1) {
                    // Simple case, add new panes up to 5
                    if (allAxesLength < 6) {
                        // Added axis, decrease first pane's height:
                        positions[0].height = correctFloat(positions[0].height - changedSpace);
                        // And update all other "top" positions:
                        positions = this.recalculateYAxisPositions(positions, changedSpace);
                    }
                    else {
                        // We have more panes, rescale all others to gain some space,
                        // This is new height for upcoming yAxis:
                        defaultHeight = 100 / allAxesLength;
                        // This is how much we need to take from each other yAxis:
                        changedSpace = defaultHeight / (allAxesLength - 1);
                        // Now update all positions:
                        positions = this.recalculateYAxisPositions(positions, changedSpace, true, -1);
                    }
                    // Set last position manually:
                    positions[allAxesLength - 1] = {
                        top: correctFloat(100 - defaultHeight),
                        height: defaultHeight
                    };
                }
                else {
                    // Less than 100%
                    changedSpace = correctFloat(1 - allAxesHeight) * 100;
                    // Simple case, return first pane it's space:
                    if (allAxesLength < 5) {
                        positions[0].height = correctFloat(positions[0].height + changedSpace);
                        positions = this.recalculateYAxisPositions(positions, changedSpace);
                    }
                    else {
                        // There were more panes, return to each pane a bit of space:
                        changedSpace /= allAxesLength;
                        // Removed axis, add extra space to the first pane:
                        // And update all other positions:
                        positions = this.recalculateYAxisPositions(positions, changedSpace, true, 1);
                    }
                }
                positions.forEach(function (position, index) {
                    // if (index === 0) debugger;
                    yAxes[index].update({
                        height: position.height + '%',
                        top: position.top + '%',
                        resize: resizers[index]
                    }, false);
                });
            },
            /**
             * Utility to modify calculated positions according to the remaining/needed
             * space. Later, these positions are used in `yAxis.update({ top, height })`
             *
             * @private
             * @function Highcharts.NavigationBindings#recalculateYAxisPositions
             * @param {Array<Highcharts.Dictionary<number>>} positions
             * Default positions of all yAxes.
             * @param {number} changedSpace
             * How much space should be added or removed.
             * @param {boolean} modifyHeight
             * Update only `top` or both `top` and `height`.
             * @param {number} adder
             * `-1` or `1`, to determine whether we should add or remove space.
             *
             * @return {Array<object>}
             *         Modified positions,
             */
            recalculateYAxisPositions: function (positions, changedSpace, modifyHeight, adder) {
                positions.forEach(function (position, index) {
                    var prevPosition = positions[index - 1];
                    position.top = !prevPosition ? 0 :
                        correctFloat(prevPosition.height + prevPosition.top);
                    if (modifyHeight) {
                        position.height = correctFloat(position.height + adder * changedSpace);
                    }
                });
                return positions;
            }
            /* eslint-enable valid-jsdoc */
        });
        /**
         * @type         {Highcharts.Dictionary<Highcharts.NavigationBindingsOptionsObject>}
         * @since        7.0.0
         * @optionparent navigation.bindings
         */
        var stockToolsBindings = {
                // Line type annotations:
                /**
                 * A segment annotation bindings. Includes `start` and one event in `steps`
                 * array.
                 *
                 * @type    {Highcharts.NavigationBindingsOptionsObject}
                 * @product highstock
                 * @default {"className": "highcharts-segment", "start": function() {}, "steps": [function() {}], "annotationsOptions": {}}
                 */
                segment: {
                    /** @ignore-option */
                    className: 'highcharts-segment',
                    // eslint-disable-next-line valid-jsdoc
                    /** @ignore-option */
                    start: function (e) {
                        var coords = this.chart.pointer.getCoordinates(e), navigation = this.chart.options.navigation, options = merge({
                            langKey: 'segment',
                            type: 'crookedLine',
                            typeOptions: {
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        }, navigation.annotationsOptions, navigation.bindings.segment.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1)
                ]
            },
            /**
             * A segment with an arrow annotation bindings. Includes `start` and one
             * event in `steps` array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-arrow-segment", "start": function() {}, "steps": [function() {}], "annotationsOptions": {}}
             */
            arrowSegment: {
                /** @ignore-option */
                className: 'highcharts-arrow-segment',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'arrowSegment',
                            type: 'crookedLine',
                            typeOptions: {
                                line: {
                                    markerEnd: 'arrow'
                                },
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.arrowSegment.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1)
                ]
            },
            /**
             * A ray annotation bindings. Includes `start` and one event in `steps`
             * array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-ray", "start": function() {}, "steps": [function() {}], "annotationsOptions": {}}
             */
            ray: {
                /** @ignore-option */
                className: 'highcharts-ray',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'ray',
                            type: 'crookedLine',
                            typeOptions: {
                                type: 'ray',
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.ray.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1)
                ]
            },
            /**
             * A ray with an arrow annotation bindings. Includes `start` and one event
             * in `steps` array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-arrow-ray", "start": function() {}, "steps": [function() {}], "annotationsOptions": {}}
             */
            arrowRay: {
                /** @ignore-option */
                className: 'highcharts-arrow-ray',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'arrowRay',
                            type: 'infinityLine',
                            typeOptions: {
                                type: 'ray',
                                line: {
                                    markerEnd: 'arrow'
                                },
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.arrowRay.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1)
                ]
            },
            /**
             * A line annotation. Includes `start` and one event in `steps` array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-infinity-line", "start": function() {}, "steps": [function() {}], "annotationsOptions": {}}
             */
            infinityLine: {
                /** @ignore-option */
                className: 'highcharts-infinity-line',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'infinityLine',
                            type: 'infinityLine',
                            typeOptions: {
                                type: 'line',
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.infinityLine.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1)
                ]
            },
            /**
             * A line with arrow annotation. Includes `start` and one event in `steps`
             * array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-arrow-infinity-line", "start": function() {}, "steps": [function() {}], "annotationsOptions": {}}
             */
            arrowInfinityLine: {
                /** @ignore-option */
                className: 'highcharts-arrow-infinity-line',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'arrowInfinityLine',
                            type: 'infinityLine',
                            typeOptions: {
                                type: 'line',
                                line: {
                                    markerEnd: 'arrow'
                                },
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.arrowInfinityLine.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1)
                ]
            },
            /**
             * A horizontal line annotation. Includes `start` event.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-horizontal-line", "start": function() {}, "annotationsOptions": {}}
             */
            horizontalLine: {
                /** @ignore-option */
                className: 'highcharts-horizontal-line',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'horizontalLine',
                            type: 'infinityLine',
                            draggable: 'y',
                            typeOptions: {
                                type: 'horizontalLine',
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.horizontalLine.annotationsOptions);
                    this.chart.addAnnotation(options);
                }
            },
            /**
             * A vertical line annotation. Includes `start` event.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-vertical-line", "start": function() {}, "annotationsOptions": {}}
             */
            verticalLine: {
                /** @ignore-option */
                className: 'highcharts-vertical-line',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'verticalLine',
                            type: 'infinityLine',
                            draggable: 'x',
                            typeOptions: {
                                type: 'verticalLine',
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.verticalLine.annotationsOptions);
                    this.chart.addAnnotation(options);
                }
            },
            /**
             * Crooked line (three points) annotation bindings. Includes `start` and two
             * events in `steps` (for second and third points in crooked line) array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-crooked3", "start": function() {}, "steps": [function() {}, function() {}], "annotationsOptions": {}}
             */
            // Crooked Line type annotations:
            crooked3: {
                /** @ignore-option */
                className: 'highcharts-crooked3',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'crooked3',
                            type: 'crookedLine',
                            typeOptions: {
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.crooked3.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1),
                    bindingsUtils.updateNthPoint(2)
                ]
            },
            /**
             * Crooked line (five points) annotation bindings. Includes `start` and four
             * events in `steps` (for all consequent points in crooked line) array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-crooked3", "start": function() {}, "steps": [function() {}, function() {}, function() {}, function() {}], "annotationsOptions": {}}
             */
            crooked5: {
                /** @ignore-option */
                className: 'highcharts-crooked5',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'crookedLine',
                            type: 'crookedLine',
                            typeOptions: {
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.crooked5.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1),
                    bindingsUtils.updateNthPoint(2),
                    bindingsUtils.updateNthPoint(3),
                    bindingsUtils.updateNthPoint(4)
                ]
            },
            /**
             * Elliott wave (three points) annotation bindings. Includes `start` and two
             * events in `steps` (for second and third points) array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-elliott3", "start": function() {}, "steps": [function() {}, function() {}], "annotationsOptions": {}}
             */
            elliott3: {
                /** @ignore-option */
                className: 'highcharts-elliott3',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'elliott3',
                            type: 'elliottWave',
                            typeOptions: {
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            },
                            labelOptions: {
                                style: {
                                    color: '#666666'
                                }
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.elliott3.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1),
                    bindingsUtils.updateNthPoint(2),
                    bindingsUtils.updateNthPoint(3)
                ]
            },
            /**
             * Elliott wave (five points) annotation bindings. Includes `start` and four
             * event in `steps` (for all consequent points in Elliott wave) array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-elliott3", "start": function() {}, "steps": [function() {}, function() {}, function() {}, function() {}], "annotationsOptions": {}}
             */
            elliott5: {
                /** @ignore-option */
                className: 'highcharts-elliott5',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'elliott5',
                            type: 'elliottWave',
                            typeOptions: {
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            },
                            labelOptions: {
                                style: {
                                    color: '#666666'
                                }
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.elliott5.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1),
                    bindingsUtils.updateNthPoint(2),
                    bindingsUtils.updateNthPoint(3),
                    bindingsUtils.updateNthPoint(4),
                    bindingsUtils.updateNthPoint(5)
                ]
            },
            /**
             * A measure (x-dimension) annotation bindings. Includes `start` and one
             * event in `steps` array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-measure-x", "start": function() {}, "steps": [function() {}], "annotationsOptions": {}}
             */
            measureX: {
                /** @ignore-option */
                className: 'highcharts-measure-x',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'measure',
                            type: 'measure',
                            typeOptions: {
                                selectType: 'x',
                                point: {
                                    x: coords.xAxis[0].value,
                                    y: coords.yAxis[0].value,
                                    xAxis: 0,
                                    yAxis: 0
                                },
                                crosshairX: {
                                    strokeWidth: 1,
                                    stroke: '#000000'
                                },
                                crosshairY: {
                                    enabled: false,
                                    strokeWidth: 0,
                                    stroke: '#000000'
                                },
                                background: {
                                    width: 0,
                                    height: 0,
                                    strokeWidth: 0,
                                    stroke: '#ffffff'
                                }
                            },
                            labelOptions: {
                                style: {
                                    color: '#666666'
                                }
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.measureX.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateRectSize
                ]
            },
            /**
             * A measure (y-dimension) annotation bindings. Includes `start` and one
             * event in `steps` array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-measure-y", "start": function() {}, "steps": [function() {}], "annotationsOptions": {}}
             */
            measureY: {
                /** @ignore-option */
                className: 'highcharts-measure-y',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'measure',
                            type: 'measure',
                            typeOptions: {
                                selectType: 'y',
                                point: {
                                    x: coords.xAxis[0].value,
                                    y: coords.yAxis[0].value,
                                    xAxis: 0,
                                    yAxis: 0
                                },
                                crosshairX: {
                                    enabled: false,
                                    strokeWidth: 0,
                                    stroke: '#000000'
                                },
                                crosshairY: {
                                    strokeWidth: 1,
                                    stroke: '#000000'
                                },
                                background: {
                                    width: 0,
                                    height: 0,
                                    strokeWidth: 0,
                                    stroke: '#ffffff'
                                }
                            },
                            labelOptions: {
                                style: {
                                    color: '#666666'
                                }
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.measureY.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateRectSize
                ]
            },
            /**
             * A measure (xy-dimension) annotation bindings. Includes `start` and one
             * event in `steps` array.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-measure-xy", "start": function() {}, "steps": [function() {}], "annotationsOptions": {}}
             */
            measureXY: {
                /** @ignore-option */
                className: 'highcharts-measure-xy',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'measure',
                            type: 'measure',
                            typeOptions: {
                                selectType: 'xy',
                                point: {
                                    x: coords.xAxis[0].value,
                                    y: coords.yAxis[0].value,
                                    xAxis: 0,
                                    yAxis: 0
                                },
                                background: {
                                    width: 0,
                                    height: 0,
                                    strokeWidth: 10
                                },
                                crosshairX: {
                                    strokeWidth: 1,
                                    stroke: '#000000'
                                },
                                crosshairY: {
                                    strokeWidth: 1,
                                    stroke: '#000000'
                                }
                            },
                            labelOptions: {
                                style: {
                                    color: '#666666'
                                }
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.measureXY.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateRectSize
                ]
            },
            // Advanced type annotations:
            /**
             * A fibonacci annotation bindings. Includes `start` and two events in
             * `steps` array (updates second point, then height).
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-fibonacci", "start": function() {}, "steps": [function() {}, function() {}], "annotationsOptions": {}}
             */
            fibonacci: {
                /** @ignore-option */
                className: 'highcharts-fibonacci',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'fibonacci',
                            type: 'fibonacci',
                            typeOptions: {
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            },
                            labelOptions: {
                                style: {
                                    color: '#666666'
                                }
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.fibonacci.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1),
                    bindingsUtils.updateHeight
                ]
            },
            /**
             * A parallel channel (tunnel) annotation bindings. Includes `start` and
             * two events in `steps` array (updates second point, then height).
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-parallel-channel", "start": function() {}, "steps": [function() {}, function() {}], "annotationsOptions": {}}
             */
            parallelChannel: {
                /** @ignore-option */
                className: 'highcharts-parallel-channel',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e),
                        navigation = this.chart.options.navigation,
                        options = merge({
                            langKey: 'parallelChannel',
                            type: 'tunnel',
                            typeOptions: {
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }]
                            }
                        },
                        navigation.annotationsOptions,
                        navigation.bindings.parallelChannel.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1),
                    bindingsUtils.updateHeight
                ]
            },
            /**
             * An Andrew's pitchfork annotation bindings. Includes `start` and two
             * events in `steps` array (sets second and third control points).
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-pitchfork", "start": function() {}, "steps": [function() {}, function() {}], "annotationsOptions": {}}
             */
            pitchfork: {
                /** @ignore-option */
                className: 'highcharts-pitchfork',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var coords = this.chart.pointer.getCoordinates(e), navigation = this.chart.options.navigation, options = merge({
                            langKey: 'pitchfork',
                            type: 'pitchfork',
                            typeOptions: {
                                points: [{
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value,
                                        controlPoint: {
                                            style: {
                                                fill: 'red'
                                            }
                                        }
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }, {
                                        x: coords.xAxis[0].value,
                                        y: coords.yAxis[0].value
                                    }],
                                innerBackground: {
                                    fill: 'rgba(100, 170, 255, 0.8)'
                                }
                            },
                            shapeOptions: {
                                strokeWidth: 2
                            }
                        }, navigation.annotationsOptions, navigation.bindings.pitchfork.annotationsOptions);
                    return this.chart.addAnnotation(options);
                },
                /** @ignore-option */
                steps: [
                    bindingsUtils.updateNthPoint(1),
                    bindingsUtils.updateNthPoint(2)
                ]
            },
            // Labels with arrow and auto increments
            /**
             * A vertical counter annotation bindings. Includes `start` event. On click,
             * finds the closest point and marks it with a numeric annotation -
             * incrementing counter on each add.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-vertical-counter", "start": function() {}, "annotationsOptions": {}}
             */
            verticalCounter: {
                /** @ignore-option */
                className: 'highcharts-vertical-counter',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var closestPoint = bindingsUtils.attractToPoint(e, this.chart), navigation = this.chart.options.navigation, verticalCounter = !defined(this.verticalCounter) ? 0 :
                            this.verticalCounter, options = merge({
                            langKey: 'verticalCounter',
                            type: 'verticalLine',
                            typeOptions: {
                                point: {
                                    x: closestPoint.x,
                                    y: closestPoint.y,
                                    xAxis: closestPoint.xAxis,
                                    yAxis: closestPoint.yAxis
                                },
                                label: {
                                    offset: closestPoint.below ? 40 : -40,
                                    text: verticalCounter.toString()
                                }
                            },
                            labelOptions: {
                                style: {
                                    color: '#666666',
                                    fontSize: '11px'
                                }
                            },
                            shapeOptions: {
                                stroke: 'rgba(0, 0, 0, 0.75)',
                                strokeWidth: 1
                            }
                        }, navigation.annotationsOptions, navigation.bindings.verticalCounter.annotationsOptions), annotation;
                    annotation = this.chart.addAnnotation(options);
                    verticalCounter++;
                    annotation.options.events.click.call(annotation, {});
                }
            },
            /**
             * A vertical arrow annotation bindings. Includes `start` event. On click,
             * finds the closest point and marks it with an arrow and a label with
             * value.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-vertical-label", "start": function() {}, "annotationsOptions": {}}
             */
            verticalLabel: {
                /** @ignore-option */
                className: 'highcharts-vertical-label',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var closestPoint = bindingsUtils.attractToPoint(e, this.chart), navigation = this.chart.options.navigation, options = merge({
                            langKey: 'verticalLabel',
                            type: 'verticalLine',
                            typeOptions: {
                                point: {
                                    x: closestPoint.x,
                                    y: closestPoint.y,
                                    xAxis: closestPoint.xAxis,
                                    yAxis: closestPoint.yAxis
                                },
                                label: {
                                    offset: closestPoint.below ? 40 : -40
                                }
                            },
                            labelOptions: {
                                style: {
                                    color: '#666666',
                                    fontSize: '11px'
                                }
                            },
                            shapeOptions: {
                                stroke: 'rgba(0, 0, 0, 0.75)',
                                strokeWidth: 1
                            }
                        }, navigation.annotationsOptions, navigation.bindings.verticalLabel.annotationsOptions), annotation;
                    annotation = this.chart.addAnnotation(options);
                    annotation.options.events.click.call(annotation, {});
                }
            },
            /**
             * A vertical arrow annotation bindings. Includes `start` event. On click,
             * finds the closest point and marks it with an arrow. Green arrow when
             * pointing from above, red when pointing from below the point.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-vertical-arrow", "start": function() {}, "annotationsOptions": {}}
             */
            verticalArrow: {
                /** @ignore-option */
                className: 'highcharts-vertical-arrow',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                start: function (e) {
                    var closestPoint = bindingsUtils.attractToPoint(e, this.chart), navigation = this.chart.options.navigation, options = merge({
                            langKey: 'verticalArrow',
                            type: 'verticalLine',
                            typeOptions: {
                                point: {
                                    x: closestPoint.x,
                                    y: closestPoint.y,
                                    xAxis: closestPoint.xAxis,
                                    yAxis: closestPoint.yAxis
                                },
                                label: {
                                    offset: closestPoint.below ? 40 : -40,
                                    format: ' '
                                },
                                connector: {
                                    fill: 'none',
                                    stroke: closestPoint.below ? 'red' : 'green'
                                }
                            },
                            shapeOptions: {
                                stroke: 'rgba(0, 0, 0, 0.75)',
                                strokeWidth: 1
                            }
                        }, navigation.annotationsOptions, navigation.bindings.verticalArrow.annotationsOptions), annotation;
                    annotation = this.chart.addAnnotation(options);
                    annotation.options.events.click.call(annotation, {});
                }
            },
            // Flag types:
            /**
             * A flag series bindings. Includes `start` event. On click, finds the
             * closest point and marks it with a flag with `'circlepin'` shape.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-flag-circlepin", "start": function() {}}
             */
            flagCirclepin: {
                /** @ignore-option */
                className: 'highcharts-flag-circlepin',
                /** @ignore-option */
                start: bindingsUtils.addFlagFromForm('circlepin')
            },
            /**
             * A flag series bindings. Includes `start` event. On click, finds the
             * closest point and marks it with a flag with `'diamondpin'` shape.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-flag-diamondpin", "start": function() {}}
             */
            flagDiamondpin: {
                /** @ignore-option */
                className: 'highcharts-flag-diamondpin',
                /** @ignore-option */
                start: bindingsUtils.addFlagFromForm('flag')
            },
            /**
             * A flag series bindings. Includes `start` event.
             * On click, finds the closest point and marks it with a flag with
             * `'squarepin'` shape.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-flag-squarepin", "start": function() {}}
             */
            flagSquarepin: {
                /** @ignore-option */
                className: 'highcharts-flag-squarepin',
                /** @ignore-option */
                start: bindingsUtils.addFlagFromForm('squarepin')
            },
            /**
             * A flag series bindings. Includes `start` event.
             * On click, finds the closest point and marks it with a flag without pin
             * shape.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-flag-simplepin", "start": function() {}}
             */
            flagSimplepin: {
                /** @ignore-option */
                className: 'highcharts-flag-simplepin',
                /** @ignore-option */
                start: bindingsUtils.addFlagFromForm('nopin')
            },
            // Other tools:
            /**
             * Enables zooming in xAxis on a chart. Includes `start` event which
             * changes [chart.zoomType](#chart.zoomType).
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-zoom-x", "init": function() {}}
             */
            zoomX: {
                /** @ignore-option */
                className: 'highcharts-zoom-x',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    this.chart.update({
                        chart: {
                            zoomType: 'x'
                        }
                    });
                    fireEvent(this, 'deselectButton', { button: button });
                }
            },
            /**
             * Enables zooming in yAxis on a chart. Includes `start` event which
             * changes [chart.zoomType](#chart.zoomType).
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-zoom-y", "init": function() {}}
             */
            zoomY: {
                /** @ignore-option */
                className: 'highcharts-zoom-y',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    this.chart.update({
                        chart: {
                            zoomType: 'y'
                        }
                    });
                    fireEvent(this, 'deselectButton', { button: button });
                }
            },
            /**
             * Enables zooming in xAxis and yAxis on a chart. Includes `start` event
             * which changes [chart.zoomType](#chart.zoomType).
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-zoom-xy", "init": function() {}}
             */
            zoomXY: {
                /** @ignore-option */
                className: 'highcharts-zoom-xy',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    this.chart.update({
                        chart: {
                            zoomType: 'xy'
                        }
                    });
                    fireEvent(this, 'deselectButton', { button: button });
                }
            },
            /**
             * Changes main series to `'line'` type.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-series-type-line", "init": function() {}}
             */
            seriesTypeLine: {
                /** @ignore-option */
                className: 'highcharts-series-type-line',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    this.chart.series[0].update({
                        type: 'line',
                        useOhlcData: true
                    });
                    fireEvent(this, 'deselectButton', { button: button });
                }
            },
            /**
             * Changes main series to `'ohlc'` type.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-series-type-ohlc", "init": function() {}}
             */
            seriesTypeOhlc: {
                /** @ignore-option */
                className: 'highcharts-series-type-ohlc',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    this.chart.series[0].update({
                        type: 'ohlc'
                    });
                    fireEvent(this, 'deselectButton', { button: button });
                }
            },
            /**
             * Changes main series to `'candlestick'` type.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-series-type-candlestick", "init": function() {}}
             */
            seriesTypeCandlestick: {
                /** @ignore-option */
                className: 'highcharts-series-type-candlestick',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    this.chart.series[0].update({
                        type: 'candlestick'
                    });
                    fireEvent(this, 'deselectButton', { button: button });
                }
            },
            /**
             * Displays chart in fullscreen.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-full-screen", "init": function() {}}
             */
            fullScreen: {
                /** @ignore-option */
                className: 'highcharts-full-screen',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    fireEvent(this, 'deselectButton', { button: button });
                }
            },
            /**
             * Hides/shows two price indicators:
             * - last price in the dataset
             * - last price in the selected range
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-current-price-indicator", "init": function() {}}
             */
            currentPriceIndicator: {
                /** @ignore-option */
                className: 'highcharts-current-price-indicator',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    var chart = this.chart,
                        series = chart.series[0],
                        options = series.options,
                        lastVisiblePrice = (options.lastVisiblePrice &&
                            options.lastVisiblePrice.enabled),
                        lastPrice = options.lastPrice && options.lastPrice.enabled,
                        gui = chart.stockTools,
                        iconsURL = gui.getIconsURL();
                    if (gui && gui.guiEnabled) {
                        if (lastPrice) {
                            button.firstChild.style['background-image'] =
                                'url("' + iconsURL +
                                    'current-price-show.svg")';
                        }
                        else {
                            button.firstChild.style['background-image'] =
                                'url("' + iconsURL +
                                    'current-price-hide.svg")';
                        }
                    }
                    series.update({
                        // line
                        lastPrice: {
                            enabled: !lastPrice,
                            color: 'red'
                        },
                        // label
                        lastVisiblePrice: {
                            enabled: !lastVisiblePrice,
                            label: {
                                enabled: true
                            }
                        }
                    });
                    fireEvent(this, 'deselectButton', { button: button });
                }
            },
            /**
             * Indicators bindings. Includes `init` event to show a popup.
             *
             * Note: In order to show base series from the chart in the popup's
             * dropdown each series requires
             * [series.id](https://api.highcharts.com/highstock/series.line.id) to be
             * defined.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-indicators", "init": function() {}}
             */
            indicators: {
                /** @ignore-option */
                className: 'highcharts-indicators',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function () {
                    var navigation = this;
                    fireEvent(navigation, 'showPopup', {
                        formType: 'indicators',
                        options: {},
                        // Callback on submit:
                        onSubmit: function (data) {
                            navigation.utils.manageIndicators.call(navigation, data);
                        }
                    });
                }
            },
            /**
             * Hides/shows all annotations on a chart.
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-toggle-annotations", "init": function() {}}
             */
            toggleAnnotations: {
                /** @ignore-option */
                className: 'highcharts-toggle-annotations',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    var chart = this.chart,
                        gui = chart.stockTools,
                        iconsURL = gui.getIconsURL();
                    this.toggledAnnotations = !this.toggledAnnotations;
                    (chart.annotations || []).forEach(function (annotation) {
                        annotation.setVisibility(!this.toggledAnnotations);
                    }, this);
                    if (gui && gui.guiEnabled) {
                        if (this.toggledAnnotations) {
                            button.firstChild.style['background-image'] =
                                'url("' + iconsURL +
                                    'annotations-hidden.svg")';
                        }
                        else {
                            button.firstChild.style['background-image'] =
                                'url("' + iconsURL +
                                    'annotations-visible.svg")';
                        }
                    }
                    fireEvent(this, 'deselectButton', { button: button });
                }
            },
            /**
             * Save a chart in localStorage under `highcharts-chart` key.
             * Stored items:
             * - annotations
             * - indicators (with yAxes)
             * - flags
             *
             * @type    {Highcharts.NavigationBindingsOptionsObject}
             * @product highstock
             * @default {"className": "highcharts-save-chart", "init": function() {}}
             */
            saveChart: {
                /** @ignore-option */
                className: 'highcharts-save-chart',
                // eslint-disable-next-line valid-jsdoc
                /** @ignore-option */
                init: function (button) {
                    var navigation = this,
                        chart = navigation.chart,
                        annotations = [],
                        indicators = [],
                        flags = [],
                        yAxes = [];
                    chart.annotations.forEach(function (annotation, index) {
                        annotations[index] = annotation.userOptions;
                    });
                    chart.series.forEach(function (series) {
                        if (series.is('sma')) {
                            indicators.push(series.userOptions);
                        }
                        else if (series.type === 'flags') {
                            flags.push(series.userOptions);
                        }
                    });
                    chart.yAxis.forEach(function (yAxis) {
                        if (navigation.utils.isNotNavigatorYAxis(yAxis)) {
                            yAxes.push(yAxis.options);
                        }
                    });
                    H.win.localStorage.setItem(PREFIX + 'chart', JSON.stringify({
                        annotations: annotations,
                        indicators: indicators,
                        flags: flags,
                        yAxes: yAxes
                    }));
                    fireEvent(this, 'deselectButton', { button: button });
                }
            }
        };
        H.setOptions({
            navigation: {
                bindings: stockToolsBindings
            }
        });

    });
    _registerModule(_modules, 'modules/stock-tools-gui.js', [_modules['parts/Globals.js'], _modules['parts/Utilities.js']], function (H, U) {
        /* *
         *
         *  GUI generator for Stock tools
         *
         *  (c) 2009-2017 Sebastian Bochan
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var addEvent = U.addEvent,
            createElement = U.createElement,
            css = U.css,
            extend = U.extend,
            fireEvent = U.fireEvent,
            getStyle = U.getStyle,
            isArray = U.isArray,
            merge = U.merge,
            pick = U.pick;
        var win = H.win, DIV = 'div', SPAN = 'span', UL = 'ul', LI = 'li', PREFIX = 'highcharts-', activeClass = PREFIX + 'active';
        H.setOptions({
            /**
             * @optionparent lang
             */
            lang: {
                /**
                 * Configure the stockTools GUI titles(hints) in the chart. Requires
                 * the `stock-tools.js` module to be loaded.
                 *
                 * @product highstock
                 * @since   7.0.0
                 */
                stockTools: {
                    gui: {
                        // Main buttons:
                        simpleShapes: 'Simple shapes',
                        lines: 'Lines',
                        crookedLines: 'Crooked lines',
                        measure: 'Measure',
                        advanced: 'Advanced',
                        toggleAnnotations: 'Toggle annotations',
                        verticalLabels: 'Vertical labels',
                        flags: 'Flags',
                        zoomChange: 'Zoom change',
                        typeChange: 'Type change',
                        saveChart: 'Save chart',
                        indicators: 'Indicators',
                        currentPriceIndicator: 'Current Price Indicators',
                        // Other features:
                        zoomX: 'Zoom X',
                        zoomY: 'Zoom Y',
                        zoomXY: 'Zooom XY',
                        fullScreen: 'Fullscreen',
                        typeOHLC: 'OHLC',
                        typeLine: 'Line',
                        typeCandlestick: 'Candlestick',
                        // Basic shapes:
                        circle: 'Circle',
                        label: 'Label',
                        rectangle: 'Rectangle',
                        // Flags:
                        flagCirclepin: 'Flag circle',
                        flagDiamondpin: 'Flag diamond',
                        flagSquarepin: 'Flag square',
                        flagSimplepin: 'Flag simple',
                        // Measures:
                        measureXY: 'Measure XY',
                        measureX: 'Measure X',
                        measureY: 'Measure Y',
                        // Segment, ray and line:
                        segment: 'Segment',
                        arrowSegment: 'Arrow segment',
                        ray: 'Ray',
                        arrowRay: 'Arrow ray',
                        line: 'Line',
                        arrowLine: 'Arrow line',
                        horizontalLine: 'Horizontal line',
                        verticalLine: 'Vertical line',
                        infinityLine: 'Infinity line',
                        // Crooked lines:
                        crooked3: 'Crooked 3 line',
                        crooked5: 'Crooked 5 line',
                        elliott3: 'Elliott 3 line',
                        elliott5: 'Elliott 5 line',
                        // Counters:
                        verticalCounter: 'Vertical counter',
                        verticalLabel: 'Vertical label',
                        verticalArrow: 'Vertical arrow',
                        // Advanced:
                        fibonacci: 'Fibonacci',
                        pitchfork: 'Pitchfork',
                        parallelChannel: 'Parallel channel'
                    }
                },
                navigation: {
                    popup: {
                        // Annotations:
                        circle: 'Circle',
                        rectangle: 'Rectangle',
                        label: 'Label',
                        segment: 'Segment',
                        arrowSegment: 'Arrow segment',
                        ray: 'Ray',
                        arrowRay: 'Arrow ray',
                        line: 'Line',
                        arrowLine: 'Arrow line',
                        horizontalLine: 'Horizontal line',
                        verticalLine: 'Vertical line',
                        crooked3: 'Crooked 3 line',
                        crooked5: 'Crooked 5 line',
                        elliott3: 'Elliott 3 line',
                        elliott5: 'Elliott 5 line',
                        verticalCounter: 'Vertical counter',
                        verticalLabel: 'Vertical label',
                        verticalArrow: 'Vertical arrow',
                        fibonacci: 'Fibonacci',
                        pitchfork: 'Pitchfork',
                        parallelChannel: 'Parallel channel',
                        infinityLine: 'Infinity line',
                        measure: 'Measure',
                        measureXY: 'Measure XY',
                        measureX: 'Measure X',
                        measureY: 'Measure Y',
                        // Flags:
                        flags: 'Flags',
                        // GUI elements:
                        addButton: 'add',
                        saveButton: 'save',
                        editButton: 'edit',
                        removeButton: 'remove',
                        series: 'Series',
                        volume: 'Volume',
                        connector: 'Connector',
                        // Field names:
                        innerBackground: 'Inner background',
                        outerBackground: 'Outer background',
                        crosshairX: 'Crosshair X',
                        crosshairY: 'Crosshair Y',
                        tunnel: 'Tunnel',
                        background: 'Background'
                    }
                }
            },
            /**
             * Configure the stockTools gui strings in the chart. Requires the
             * [stockTools module]() to be loaded. For a description of the module
             * and information on its features, see [Highcharts StockTools]().
             *
             * @product highstock
             *
             * @sample stock/demo/stock-tools-gui Stock Tools GUI
             *
             * @sample stock/demo/stock-tools-custom-gui Stock Tools customized GUI
             *
             * @since        7.0.0
             * @optionparent stockTools
             */
            stockTools: {
                /**
                 * Definitions of buttons in Stock Tools GUI.
                 */
                gui: {
                    /**
                     * Path where Highcharts will look for icons. Change this to use
                     * icons from a different server.
                     *
                     * Since 7.1.3 use [iconsURL](#navigation.iconsURL) for popup and
                     * stock tools.
                     *
                     * @deprecated
                     * @apioption stockTools.gui.iconsURL
                     *
                     */
                    /**
                     * Enable or disable the stockTools gui.
                     */
                    enabled: true,
                    /**
                     * A CSS class name to apply to the stocktools' div,
                     * allowing unique CSS styling for each chart.
                     */
                    className: 'highcharts-bindings-wrapper',
                    /**
                     * A CSS class name to apply to the container of buttons,
                     * allowing unique CSS styling for each chart.
                     */
                    toolbarClassName: 'stocktools-toolbar',
                    /**
                     * A collection of strings pointing to config options for the
                     * toolbar items. Each name refers to unique key from definitions
                     * object.
                     *
                     * @default [
                     *   'indicators',
                     *   'separator',
                     *   'simpleShapes',
                     *   'lines',
                     *   'crookedLines',
                     *   'measure',
                     *   'advanced',
                     *   'toggleAnnotations',
                     *   'separator',
                     *   'verticalLabels',
                     *   'flags',
                     *   'separator',
                     *   'zoomChange',
                     *   'fullScreen',
                     *   'typeChange',
                     *   'separator',
                     *   'currentPriceIndicator',
                     *   'saveChart'
                     * ]
                     */
                    buttons: [
                        'indicators',
                        'separator',
                        'simpleShapes',
                        'lines',
                        'crookedLines',
                        'measure',
                        'advanced',
                        'toggleAnnotations',
                        'separator',
                        'verticalLabels',
                        'flags',
                        'separator',
                        'zoomChange',
                        'fullScreen',
                        'typeChange',
                        'separator',
                        'currentPriceIndicator',
                        'saveChart'
                    ],
                    /**
                     * An options object of the buttons definitions. Each name refers to
                     * unique key from buttons array.
                     */
                    definitions: {
                        separator: {
                            /**
                             * A predefined background symbol for the button.
                             */
                            symbol: 'separator.svg'
                        },
                        simpleShapes: {
                            /**
                             * A collection of strings pointing to config options for
                             * the items.
                             *
                             * @type {array}
                             * @default [
                             *   'label',
                             *   'circle',
                             *   'rectangle'
                             * ]
                             *
                             */
                            items: [
                                'label',
                                'circle',
                                'rectangle'
                            ],
                            circle: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 *
                                 */
                                symbol: 'circle.svg'
                            },
                            rectangle: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 *
                                 */
                                symbol: 'rectangle.svg'
                            },
                            label: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 *
                                 */
                                symbol: 'label.svg'
                            }
                        },
                        flags: {
                            /**
                             * A collection of strings pointing to config options for
                             * the items.
                             *
                             * @type {array}
                             * @default [
                             *   'flagCirclepin',
                             *   'flagDiamondpin',
                             *   'flagSquarepin',
                             *   'flagSimplepin'
                             * ]
                             *
                             */
                            items: [
                                'flagCirclepin',
                                'flagDiamondpin',
                                'flagSquarepin',
                                'flagSimplepin'
                            ],
                            flagSimplepin: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 *
                                 */
                                symbol: 'flag-basic.svg'
                            },
                            flagDiamondpin: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 *
                                 */
                                symbol: 'flag-diamond.svg'
                            },
                            flagSquarepin: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'flag-trapeze.svg'
                            },
                            flagCirclepin: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'flag-elipse.svg'
                            }
                        },
                        lines: {
                            /**
                             * A collection of strings pointing to config options for
                             * the items.
                             *
                             * @type {array}
                             * @default [
                             *   'segment',
                             *   'arrowSegment',
                             *   'ray',
                             *   'arrowRay',
                             *   'line',
                             *   'arrowLine',
                             *   'horizontalLine',
                             *   'verticalLine'
                             * ]
                             */
                            items: [
                                'segment',
                                'arrowSegment',
                                'ray',
                                'arrowRay',
                                'line',
                                'arrowLine',
                                'horizontalLine',
                                'verticalLine'
                            ],
                            segment: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'segment.svg'
                            },
                            arrowSegment: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'arrow-segment.svg'
                            },
                            ray: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'ray.svg'
                            },
                            arrowRay: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'arrow-ray.svg'
                            },
                            line: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'line.svg'
                            },
                            arrowLine: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'arrow-line.svg'
                            },
                            verticalLine: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'vertical-line.svg'
                            },
                            horizontalLine: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'horizontal-line.svg'
                            }
                        },
                        crookedLines: {
                            /**
                             * A collection of strings pointing to config options for
                             * the items.
                             *
                             * @type {array}
                             * @default [
                             *   'elliott3',
                             *   'elliott5',
                             *   'crooked3',
                             *   'crooked5'
                             * ]
                             *
                             */
                            items: [
                                'elliott3',
                                'elliott5',
                                'crooked3',
                                'crooked5'
                            ],
                            crooked3: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'crooked-3.svg'
                            },
                            crooked5: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'crooked-5.svg'
                            },
                            elliott3: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'elliott-3.svg'
                            },
                            elliott5: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'elliott-5.svg'
                            }
                        },
                        verticalLabels: {
                            /**
                             * A collection of strings pointing to config options for
                             * the items.
                             *
                             * @type {array}
                             * @default [
                             *   'verticalCounter',
                             *   'verticalLabel',
                             *   'verticalArrow'
                             * ]
                             */
                            items: [
                                'verticalCounter',
                                'verticalLabel',
                                'verticalArrow'
                            ],
                            verticalCounter: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'vertical-counter.svg'
                            },
                            verticalLabel: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'vertical-label.svg'
                            },
                            verticalArrow: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'vertical-arrow.svg'
                            }
                        },
                        advanced: {
                            /**
                             * A collection of strings pointing to config options for
                             * the items.
                             *
                             * @type {array}
                             * @default [
                             *   'fibonacci',
                             *   'pitchfork',
                             *   'parallelChannel'
                             * ]
                             */
                            items: [
                                'fibonacci',
                                'pitchfork',
                                'parallelChannel'
                            ],
                            pitchfork: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'pitchfork.svg'
                            },
                            fibonacci: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'fibonacci.svg'
                            },
                            parallelChannel: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'parallel-channel.svg'
                            }
                        },
                        measure: {
                            /**
                             * A collection of strings pointing to config options for
                             * the items.
                             *
                             * @type {array}
                             * @default [
                             *   'measureXY',
                             *   'measureX',
                             *   'measureY'
                             * ]
                             */
                            items: [
                                'measureXY',
                                'measureX',
                                'measureY'
                            ],
                            measureX: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'measure-x.svg'
                            },
                            measureY: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'measure-y.svg'
                            },
                            measureXY: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'measure-xy.svg'
                            }
                        },
                        toggleAnnotations: {
                            /**
                             * A predefined background symbol for the button.
                             *
                             * @type   {string}
                             */
                            symbol: 'annotations-visible.svg'
                        },
                        currentPriceIndicator: {
                            /**
                             * A predefined background symbol for the button.
                             *
                             * @type   {string}
                             */
                            symbol: 'current-price-show.svg'
                        },
                        indicators: {
                            /**
                             * A predefined background symbol for the button.
                             *
                             * @type   {string}
                             */
                            symbol: 'indicators.svg'
                        },
                        zoomChange: {
                            /**
                             * A collection of strings pointing to config options for
                             * the items.
                             *
                             * @type {array}
                             * @default [
                             *   'zoomX',
                             *   'zoomY',
                             *   'zoomXY'
                             * ]
                             */
                            items: [
                                'zoomX',
                                'zoomY',
                                'zoomXY'
                            ],
                            zoomX: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'zoom-x.svg'
                            },
                            zoomY: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'zoom-y.svg'
                            },
                            zoomXY: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'zoom-xy.svg'
                            }
                        },
                        typeChange: {
                            /**
                             * A collection of strings pointing to config options for
                             * the items.
                             *
                             * @type {array}
                             * @default [
                             *   'typeOHLC',
                             *   'typeLine',
                             *   'typeCandlestick'
                             * ]
                             */
                            items: [
                                'typeOHLC',
                                'typeLine',
                                'typeCandlestick'
                            ],
                            typeOHLC: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'series-ohlc.svg'
                            },
                            typeLine: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'series-line.svg'
                            },
                            typeCandlestick: {
                                /**
                                 * A predefined background symbol for the button.
                                 *
                                 * @type   {string}
                                 */
                                symbol: 'series-candlestick.svg'
                            }
                        },
                        fullScreen: {
                            /**
                             * A predefined background symbol for the button.
                             *
                             * @type   {string}
                             */
                            symbol: 'fullscreen.svg'
                        },
                        saveChart: {
                            /**
                             * A predefined background symbol for the button.
                             *
                             * @type   {string}
                             */
                            symbol: 'save-chart.svg'
                        }
                    }
                }
            }
        });
        /* eslint-disable no-invalid-this, valid-jsdoc */
        // Run HTML generator
        addEvent(H.Chart, 'afterGetContainer', function () {
            this.setStockTools();
        });
        addEvent(H.Chart, 'getMargins', function () {
            var listWrapper = this.stockTools && this.stockTools.listWrapper,
                offsetWidth = listWrapper && ((listWrapper.startWidth +
                    getStyle(listWrapper, 'padding-left') +
                    getStyle(listWrapper, 'padding-right')) || listWrapper.offsetWidth);
            if (offsetWidth && offsetWidth < this.plotWidth) {
                this.plotLeft += offsetWidth;
            }
        });
        addEvent(H.Chart, 'destroy', function () {
            if (this.stockTools) {
                this.stockTools.destroy();
            }
        });
        addEvent(H.Chart, 'redraw', function () {
            if (this.stockTools && this.stockTools.guiEnabled) {
                this.stockTools.redraw();
            }
        });
        /**
         * Toolbar Class
         * @private
         * @constructor
         * @param {Object} - options of toolbar
         * @param {Chart} - Reference to chart
         */
        H.Toolbar = function (options, langOptions, chart) {
            this.chart = chart;
            this.options = options;
            this.lang = langOptions;
            // set url for icons.
            this.iconsURL = this.getIconsURL();
            this.guiEnabled = options.enabled;
            this.visible = pick(options.visible, true);
            this.placed = pick(options.placed, false);
            // General events collection which should be removed upon destroy/update:
            this.eventsToUnbind = [];
            if (this.guiEnabled) {
                this.createHTML();
                this.init();
                this.showHideNavigatorion();
            }
            fireEvent(this, 'afterInit');
        };
        extend(H.Chart.prototype, {
            /**
             * Verify if Toolbar should be added.
             * @private
             * @param {Highcharts.StockToolsOptions} - chart options
             * @return {void}
             */
            setStockTools: function (options) {
                var chartOptions = this.options,
                    lang = chartOptions.lang,
                    guiOptions = merge(chartOptions.stockTools && chartOptions.stockTools.gui,
                    options && options.gui),
                    langOptions = lang.stockTools && lang.stockTools.gui;
                this.stockTools = new H.Toolbar(guiOptions, langOptions, this);
                if (this.stockTools.guiEnabled) {
                    this.isDirtyBox = true;
                }
            }
        });
        H.Toolbar.prototype = {
            /**
             * Initialize the toolbar. Create buttons and submenu for each option
             * defined in `stockTools.gui`.
             * @private
             */
            init: function () {
                var _self = this,
                    lang = this.lang,
                    guiOptions = this.options,
                    toolbar = this.toolbar,
                    addSubmenu = _self.addSubmenu,
                    buttons = guiOptions.buttons,
                    defs = guiOptions.definitions,
                    allButtons = toolbar.childNodes,
                    inIframe = this.inIframe(),
                    button;
                // create buttons
                buttons.forEach(function (btnName) {
                    button = _self.addButton(toolbar, defs, btnName, lang);
                    if (inIframe && btnName === 'fullScreen') {
                        button.buttonWrapper.className +=
                            ' ' + PREFIX + 'disabled-btn';
                    }
                    _self.eventsToUnbind.push(addEvent(button.buttonWrapper, 'click', function () {
                        _self.eraseActiveButtons(allButtons, button.buttonWrapper);
                    }));
                    if (isArray(defs[btnName].items)) {
                        // create submenu buttons
                        addSubmenu.call(_self, button, defs[btnName]);
                    }
                });
            },
            /**
             * Create submenu (list of buttons) for the option. In example main button
             * is Line, in submenu will be buttons with types of lines.
             * @private
             * @param {Highcharts.Dictionary<Highcharts.HTMLDOMElement>}
             * button which has submenu
             * @param {Highcharts.StockToolsGuiDefinitionsButtonsOptions}
             * list of all buttons
             */
            addSubmenu: function (parentBtn, button) {
                var _self = this,
                    submenuArrow = parentBtn.submenuArrow,
                    buttonWrapper = parentBtn.buttonWrapper,
                    buttonWidth = getStyle(buttonWrapper, 'width'),
                    wrapper = this.wrapper,
                    menuWrapper = this.listWrapper,
                    allButtons = this.toolbar.childNodes,
                    topMargin = 0,
                    submenuWrapper;
                // create submenu container
                this.submenu = submenuWrapper = createElement(UL, {
                    className: PREFIX + 'submenu-wrapper'
                }, null, buttonWrapper);
                // create submenu buttons and select the first one
                this.addSubmenuItems(buttonWrapper, button);
                // show / hide submenu
                _self.eventsToUnbind.push(addEvent(submenuArrow, 'click', function (e) {
                    e.stopPropagation();
                    // Erase active class on all other buttons
                    _self.eraseActiveButtons(allButtons, buttonWrapper);
                    // hide menu
                    if (buttonWrapper.className.indexOf(PREFIX + 'current') >= 0) {
                        menuWrapper.style.width =
                            menuWrapper.startWidth + 'px';
                        buttonWrapper.classList.remove(PREFIX + 'current');
                        submenuWrapper.style.display = 'none';
                    }
                    else {
                        // show menu
                        // to calculate height of element
                        submenuWrapper.style.display = 'block';
                        topMargin = submenuWrapper.offsetHeight -
                            buttonWrapper.offsetHeight - 3;
                        // calculate position of submenu in the box
                        // if submenu is inside, reset top margin
                        if (
                        // cut on the bottom
                        !(submenuWrapper.offsetHeight +
                            buttonWrapper.offsetTop >
                            wrapper.offsetHeight &&
                            // cut on the top
                            buttonWrapper.offsetTop > topMargin)) {
                            topMargin = 0;
                        }
                        // apply calculated styles
                        css(submenuWrapper, {
                            top: -topMargin + 'px',
                            left: buttonWidth + 3 + 'px'
                        });
                        buttonWrapper.className += ' ' + PREFIX + 'current';
                        menuWrapper.startWidth = wrapper.offsetWidth;
                        menuWrapper.style.width = menuWrapper.startWidth +
                            getStyle(menuWrapper, 'padding-left') +
                            submenuWrapper.offsetWidth + 3 + 'px';
                    }
                }));
            },
            /**
             * Create buttons in submenu
             * @private
             * @param {Highcharts.HTMLDOMElement}
             * button where submenu is placed
             * @param {Highcharts.StockToolsGuiDefinitionsButtonsOptions}
             * list of all buttons options
             *
             */
            addSubmenuItems: function (buttonWrapper, button) {
                var _self = this,
                    submenuWrapper = this.submenu,
                    lang = this.lang,
                    menuWrapper = this.listWrapper,
                    items = button.items,
                    firstSubmenuItem,
                    submenuBtn;
                // add items to submenu
                items.forEach(function (btnName) {
                    // add buttons to submenu
                    submenuBtn = _self.addButton(submenuWrapper, button, btnName, lang);
                    _self.eventsToUnbind.push(addEvent(submenuBtn.mainButton, 'click', function () {
                        _self.switchSymbol(this, buttonWrapper, true);
                        menuWrapper.style.width =
                            menuWrapper.startWidth + 'px';
                        submenuWrapper.style.display = 'none';
                    }));
                });
                // select first submenu item
                firstSubmenuItem = submenuWrapper
                    .querySelectorAll('li > .' + PREFIX + 'menu-item-btn')[0];
                // replace current symbol, in main button, with submenu's button style
                _self.switchSymbol(firstSubmenuItem, false);
            },
            /*
             * Erase active class on all other buttons.
             *
             * @param {Array} - Array of HTML buttons
             * @param {HTMLDOMElement} - Current HTML button
             *
             */
            eraseActiveButtons: function (buttons, currentButton, submenuItems) {
                [].forEach.call(buttons, function (btn) {
                    if (btn !== currentButton) {
                        btn.classList.remove(PREFIX + 'current');
                        btn.classList.remove(PREFIX + 'active');
                        submenuItems =
                            btn.querySelectorAll('.' + PREFIX + 'submenu-wrapper');
                        // hide submenu
                        if (submenuItems.length > 0) {
                            submenuItems[0].style.display = 'none';
                        }
                    }
                });
            },
            /**
             * Create single button. Consist of HTML elements `li`, `span`, and (if
             * exists) submenu container.
             * @private
             * @param {HTMLDOMElement} - HTML reference, where button should be added
             * @param {Object} - all options, by btnName refer to particular button
             * @param {String} - name of functionality mapped for specific class
             * @param {Object} - All titles, by btnName refer to particular button
             * @return {Object} - references to all created HTML elements
             */
            addButton: function (target, options, btnName, lang) {
                var btnOptions = options[btnName],
                    items = btnOptions.items,
                    classMapping = H.Toolbar.prototype.classMapping,
                    userClassName = btnOptions.className || '',
                    mainButton,
                    submenuArrow,
                    buttonWrapper;
                // main button wrapper
                buttonWrapper = createElement(LI, {
                    className: pick(classMapping[btnName], '') + ' ' + userClassName,
                    title: lang[btnName] || btnName
                }, null, target);
                // single button
                mainButton = createElement(SPAN, {
                    className: PREFIX + 'menu-item-btn'
                }, null, buttonWrapper);
                // submenu
                if (items && items.length) {
                    // arrow is a hook to show / hide submenu
                    submenuArrow = createElement(SPAN, {
                        className: PREFIX + 'submenu-item-arrow ' +
                            PREFIX + 'arrow-right'
                    }, null, buttonWrapper);
                    submenuArrow.style['background-image'] = 'url(' +
                        this.iconsURL + 'arrow-bottom.svg)';
                }
                else {
                    mainButton.style['background-image'] = 'url(' +
                        this.iconsURL + btnOptions.symbol + ')';
                }
                return {
                    buttonWrapper: buttonWrapper,
                    mainButton: mainButton,
                    submenuArrow: submenuArrow
                };
            },
            /*
             * Create navigation's HTML elements: container and arrows.
             *
             */
            addNavigation: function () {
                var stockToolbar = this,
                    wrapper = stockToolbar.wrapper;
                // arrow wrapper
                stockToolbar.arrowWrapper = createElement(DIV, {
                    className: PREFIX + 'arrow-wrapper'
                });
                stockToolbar.arrowUp = createElement(DIV, {
                    className: PREFIX + 'arrow-up'
                }, null, stockToolbar.arrowWrapper);
                stockToolbar.arrowUp.style['background-image'] =
                    'url(' + this.iconsURL + 'arrow-right.svg)';
                stockToolbar.arrowDown = createElement(DIV, {
                    className: PREFIX + 'arrow-down'
                }, null, stockToolbar.arrowWrapper);
                stockToolbar.arrowDown.style['background-image'] =
                    'url(' + this.iconsURL + 'arrow-right.svg)';
                wrapper.insertBefore(stockToolbar.arrowWrapper, wrapper.childNodes[0]);
                // attach scroll events
                stockToolbar.scrollButtons();
            },
            /*
             * Add events to navigation (two arrows) which allows user to scroll
             * top/down GUI buttons, if container's height is not enough.
             *
             */
            scrollButtons: function () {
                var targetY = 0,
                    _self = this,
                    wrapper = _self.wrapper,
                    toolbar = _self.toolbar,
                    step = 0.1 * wrapper.offsetHeight; // 0.1 = 10%
                    _self.eventsToUnbind.push(addEvent(_self.arrowUp, 'click',
                    function () {
                        if (targetY > 0) {
                            targetY -= step;
                        toolbar.style['margin-top'] = -targetY + 'px';
                    }
                }));
                _self.eventsToUnbind.push(addEvent(_self.arrowDown, 'click', function () {
                    if (wrapper.offsetHeight + targetY <=
                        toolbar.offsetHeight + step) {
                        targetY += step;
                        toolbar.style['margin-top'] = -targetY + 'px';
                    }
                }));
            },
            /*
             * Create stockTools HTML main elements.
             *
             */
            createHTML: function () {
                var stockToolbar = this,
                    chart = stockToolbar.chart,
                    guiOptions = stockToolbar.options,
                    container = chart.container,
                    navigation = chart.options.navigation,
                    bindingsClassName = navigation && navigation.bindingsClassName,
                    listWrapper,
                    toolbar,
                    wrapper;
                // create main container
                stockToolbar.wrapper = wrapper = createElement(DIV, {
                    className: PREFIX + 'stocktools-wrapper ' +
                        guiOptions.className + ' ' + bindingsClassName
                });
                container.parentNode.insertBefore(wrapper, container);
                // toolbar
                stockToolbar.toolbar = toolbar = createElement(UL, {
                    className: PREFIX + 'stocktools-toolbar ' +
                        guiOptions.toolbarClassName
                });
                // add container for list of buttons
                stockToolbar.listWrapper = listWrapper = createElement(DIV, {
                    className: PREFIX + 'menu-wrapper'
                });
                wrapper.insertBefore(listWrapper, wrapper.childNodes[0]);
                listWrapper.insertBefore(toolbar, listWrapper.childNodes[0]);
                stockToolbar.showHideToolbar();
                // add navigation which allows user to scroll down / top GUI buttons
                stockToolbar.addNavigation();
            },
            /**
             * Function called in redraw verifies if the navigation should be visible.
             * @private
             */
            showHideNavigatorion: function () {
                // arrows
                // 50px space for arrows
                if (this.visible &&
                    this.toolbar.offsetHeight > (this.wrapper.offsetHeight - 50)) {
                    this.arrowWrapper.style.display = 'block';
                }
                else {
                    // reset margin if whole toolbar is visible
                    this.toolbar.style.marginTop = '0px';
                    // hide arrows
                    this.arrowWrapper.style.display = 'none';
                }
            },
            /**
             * Create button which shows or hides GUI toolbar.
             * @private
             */
            showHideToolbar: function () {
                var stockToolbar = this,
                    chart = this.chart,
                    wrapper = stockToolbar.wrapper,
                    toolbar = this.listWrapper,
                    submenu = this.submenu,
                    visible = this.visible,
                    showhideBtn;
                // Show hide toolbar
                this.showhideBtn = showhideBtn = createElement(DIV, {
                    className: PREFIX + 'toggle-toolbar ' + PREFIX + 'arrow-left'
                }, null, wrapper);
                showhideBtn.style['background-image'] =
                    'url(' + this.iconsURL + 'arrow-right.svg)';
                if (!visible) {
                    // hide
                    if (submenu) {
                        submenu.style.display = 'none';
                    }
                    showhideBtn.style.left = '0px';
                    stockToolbar.visible = visible = false;
                    toolbar.classList.add(PREFIX + 'hide');
                    showhideBtn.classList.toggle(PREFIX + 'arrow-right');
                    wrapper.style.height = showhideBtn.offsetHeight + 'px';
                }
                else {
                    wrapper.style.height = '100%';
                    showhideBtn.style.top = getStyle(toolbar, 'padding-top') + 'px';
                    showhideBtn.style.left = (wrapper.offsetWidth +
                        getStyle(toolbar, 'padding-left')) + 'px';
                }
                // Toggle menu
                stockToolbar.eventsToUnbind.push(addEvent(showhideBtn, 'click', function () {
                    chart.update({
                        stockTools: {
                            gui: {
                                visible: !visible,
                                placed: true
                            }
                        }
                    });
                }));
            },
            /*
             * In main GUI button, replace icon and class with submenu button's
             * class / symbol.
             *
             * @param {HTMLDOMElement} - submenu button
             * @param {Boolean} - true or false
             *
             */
            switchSymbol: function (button, redraw) {
                var buttonWrapper = button.parentNode,
                    buttonWrapperClass = buttonWrapper.classList.value, 
                    // main button in first level og GUI
                    mainNavButton = buttonWrapper.parentNode.parentNode;
                // set class
                mainNavButton.className = '';
                if (buttonWrapperClass) {
                    mainNavButton.classList.add(buttonWrapperClass.trim());
                }
                // set icon
                mainNavButton
                    .querySelectorAll('.' + PREFIX + 'menu-item-btn')[0]
                    .style['background-image'] =
                    button.style['background-image'];
                // set active class
                if (redraw) {
                    this.selectButton(mainNavButton);
                }
            },
            /*
             * Set select state (active class) on button.
             *
             * @param {HTMLDOMElement} - button
             *
             */
            selectButton: function (button) {
                if (button.className.indexOf(activeClass) >= 0) {
                    button.classList.remove(activeClass);
                }
                else {
                    button.classList.add(activeClass);
                }
            },
            /*
             * Remove active class from all buttons except defined.
             *
             * @param {HTMLDOMElement} - button which should not be deactivated
             *
             */
            unselectAllButtons: function (button) {
                var activeButtons = button.parentNode
                        .querySelectorAll('.' + activeClass);
                [].forEach.call(activeButtons, function (activeBtn) {
                    if (activeBtn !== button) {
                        activeBtn.classList.remove(activeClass);
                    }
                });
            },
            /*
             * Verify if chart is in iframe.
             *
             * @return {Object} - elements translations.
             */
            inIframe: function () {
                try {
                    return win.self !== win.top;
                }
                catch (e) {
                    return true;
                }
            },
            /*
             * Update GUI with given options.
             *
             * @param {Object} - general options for Stock Tools
             */
            update: function (options) {
                merge(true, this.chart.options.stockTools, options);
                this.destroy();
                this.chart.setStockTools(options);
                // If Stock Tools are updated, then bindings should be updated too:
                if (this.chart.navigationBindings) {
                    this.chart.navigationBindings.update();
                }
            },
            /**
             * Destroy all HTML GUI elements.
             * @private
             */
            destroy: function () {
                var stockToolsDiv = this.wrapper,
                    parent = stockToolsDiv && stockToolsDiv.parentNode;
                this.eventsToUnbind.forEach(function (unbinder) {
                    unbinder();
                });
                // Remove the empty element
                if (parent) {
                    parent.removeChild(stockToolsDiv);
                }
                // redraw
                this.chart.isDirtyBox = true;
                this.chart.redraw();
            },
            /**
             * Redraw, GUI requires to verify if the navigation should be visible.
             * @private
             */
            redraw: function () {
                this.showHideNavigatorion();
            },
            getIconsURL: function () {
                return this.chart.options.navigation.iconsURL ||
                    this.options.iconsURL ||
                    'https://code.highcharts.com/8.0.1/gfx/stock-icons/';
            },
            /**
             * Mapping JSON fields to CSS classes.
             * @private
             */
            classMapping: {
                circle: PREFIX + 'circle-annotation',
                rectangle: PREFIX + 'rectangle-annotation',
                label: PREFIX + 'label-annotation',
                segment: PREFIX + 'segment',
                arrowSegment: PREFIX + 'arrow-segment',
                ray: PREFIX + 'ray',
                arrowRay: PREFIX + 'arrow-ray',
                line: PREFIX + 'infinity-line',
                arrowLine: PREFIX + 'arrow-infinity-line',
                verticalLine: PREFIX + 'vertical-line',
                horizontalLine: PREFIX + 'horizontal-line',
                crooked3: PREFIX + 'crooked3',
                crooked5: PREFIX + 'crooked5',
                elliott3: PREFIX + 'elliott3',
                elliott5: PREFIX + 'elliott5',
                pitchfork: PREFIX + 'pitchfork',
                fibonacci: PREFIX + 'fibonacci',
                parallelChannel: PREFIX + 'parallel-channel',
                measureX: PREFIX + 'measure-x',
                measureY: PREFIX + 'measure-y',
                measureXY: PREFIX + 'measure-xy',
                verticalCounter: PREFIX + 'vertical-counter',
                verticalLabel: PREFIX + 'vertical-label',
                verticalArrow: PREFIX + 'vertical-arrow',
                currentPriceIndicator: PREFIX + 'current-price-indicator',
                indicators: PREFIX + 'indicators',
                flagCirclepin: PREFIX + 'flag-circlepin',
                flagDiamondpin: PREFIX + 'flag-diamondpin',
                flagSquarepin: PREFIX + 'flag-squarepin',
                flagSimplepin: PREFIX + 'flag-simplepin',
                zoomX: PREFIX + 'zoom-x',
                zoomY: PREFIX + 'zoom-y',
                zoomXY: PREFIX + 'zoom-xy',
                typeLine: PREFIX + 'series-type-line',
                typeOHLC: PREFIX + 'series-type-ohlc',
                typeCandlestick: PREFIX + 'series-type-candlestick',
                fullScreen: PREFIX + 'full-screen',
                toggleAnnotations: PREFIX + 'toggle-annotations',
                saveChart: PREFIX + 'save-chart',
                separator: PREFIX + 'separator'
            }
        };
        // Comunication with bindings:
        addEvent(H.NavigationBindings, 'selectButton', function (event) {
            var button = event.button,
                className = PREFIX + 'submenu-wrapper',
                gui = this.chart.stockTools;
            if (gui && gui.guiEnabled) {
                // Unslect other active buttons
                gui.unselectAllButtons(event.button);
                // If clicked on a submenu, select state for it's parent
                if (button.parentNode.className.indexOf(className) >= 0) {
                    button = button.parentNode.parentNode;
                }
                // Set active class on the current button
                gui.selectButton(button);
            }
        });
        addEvent(H.NavigationBindings, 'deselectButton', function (event) {
            var button = event.button,
                className = PREFIX + 'submenu-wrapper',
                gui = this.chart.stockTools;
            if (gui && gui.guiEnabled) {
                // If deselecting a button from a submenu, select state for it's parent
                if (button.parentNode.className.indexOf(className) >= 0) {
                    button = button.parentNode.parentNode;
                }
                gui.selectButton(button);
            }
        });

    });
    _registerModule(_modules, 'masters/modules/stock-tools.src.js', [], function () {


    });
}));