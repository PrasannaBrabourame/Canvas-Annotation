/*
djaodjin-annotate.js v0.0.4
Copyright (c) 2015, Djaodjin Inc.
MIT License
*/
/* global document jQuery Image window:true*/

(function($) {
    'use strict';
    /**
     * Function to annotate the image
     * @param {[type]} el      [description]
     * @param {Object} options [description]
     */
    function Annotate(el, options) {
        this.options = options;
        this.$el = $(el);
        this.mode = "tool";
        this.edit_mode = "";
        this.clicked = false;
        this.fromx = null;
        this.fromy = null;
        this.fromxText = null;
        this.fromyText = null;
        this.tox = null;
        this.toy = null;
        this.points = [];
        this.storedUndo = [];
        this.storedElement = [];
        this.images = [];
        this.img = null;
        this.selectedImage = null;
        this.currentWidth = null;
        this.currentHeight = null;
        this.img_width = null;
        this.img_height = null;
        this.scale = 1;
        this.selectImageSize = {};
        this.compensationWidthRate = 1;
        this.linewidth = 1;
        this.fontsize = 1;
        this.cropSizeMinW = 200;
        this.cropSizeMinH = 150;
        this.init();
    }
    Annotate.prototype = {
        init: function() {
            var self = this;
            self.linewidth = self.options.linewidth;
            self.fontsize = self.options.fontsize;
            self.lineheight = self.fontsize + self.options.lineheight_bous;
            self.$el.addClass('annotate-container');
            self.$el.css({
                cursor: 'crosshair'
            });
            self.baseLayerId = 'baseLayer_' + self.$el.attr('id');
            self.drawingLayerId = 'drawingLayer_' + self.$el.attr('id');
            self.toolOptionId = 'tool_option_' + self.$el.attr('id');
            self.$el.append($('<div class="canvas-container"></div>'))
            self.$el.find(".canvas-container").append($('<canvas id="' + self.baseLayerId + '"></canvas>'));
            self.$el.find(".canvas-container").append($('<canvas id="' + self.drawingLayerId +
                '"></canvas>'));
            self.baseCanvas = document.getElementById(self.baseLayerId);
            self.drawingCanvas = document.getElementById(self.drawingLayerId);
            self.baseContext = self.baseCanvas.getContext('2d');
            self.drawingContext = self.drawingCanvas.getContext('2d');
            self.baseContext.lineJoin = 'round';
            self.drawingContext.lineJoin = 'round';
            var classPosition1 = 'btn-group annotator-btn-group';
            var classPosition2 = '';
            if (self.options.position === 'left' || self.options.position ===
                'right') {
                classPosition1 = 'btn-group-vertical annotator-btn-group';
                classPosition2 = 'btn-block';
            }


            if (self.options.bootstrap) {
                self.$tool = '<div class="top-toolbar" id="">' +

                    '<div class="cropbar btn-group annotator-btn-group hidden">' +
                    '<button type="button" id="crop-ok"' +
                    ' title="Accept crop"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-ok"></i></button>' +
                    '<button type="button" id="tool-mode"' +
                    ' title="Cancle crop"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-remove"></i></button>' +
                    '</div>' +

                    '<div class="textbar btn-group annotator-btn-group hidden">' +

                    '<button type="button" id="tool-mode"' +
                    ' title="Back to Tools"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-remove"></i></button>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="move"' +
                    'data-edit="text"' +
                    ' data-toggle="tooltip" data-placement="top" title="Move Text">' +
                    '<i class="glyphicon glyphicon-fullscreen"></i></label>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="delete"' +
                    'data-edit="text"' +
                    ' data-toggle="tooltip" data-placement="top" title="Delete Text">' +
                    '<i class="glyphicon glyphicon-trash"></i></label>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="edit"' +
                    'data-edit="text"' +
                    ' data-toggle="tooltip" data-placement="top" title="Delete Text">' +
                    '<i class="glyphicon glyphicon-pencil"></i></label>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="text"' +
                    ' data-toggle="tooltip"' +
                    'data-placement="top" title="Write some text">' +
                    '<i class="glyphicon glyphicon-font"></i>' +
                    '</label>' +

                    '</div>' +

                    '<div class="arrowbar btn-group annotator-btn-group hidden">' +

                    '<button type="button" id="tool-mode"' +
                    ' title="Back to Tools"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-remove"></i></button>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="move"' +
                    'data-edit="arrow"' +
                    ' data-toggle="tooltip" data-placement="top" title="Move Arrow">' +
                    '<i class="glyphicon glyphicon-fullscreen"></i></label>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="delete"' +
                    'data-edit="arrow"' +
                    ' data-toggle="tooltip" data-placement="top" title="Delete Arrow">' +
                    '<i class="glyphicon glyphicon-trash"></i></label>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="arrow"' +
                    ' data-toggle="tooltip" data-placement="top" title="Draw an arrow">' +
                    '<i class="glyphicon glyphicon-arrow-up"></i></label>' +
                    '</label>' +

                    '</div>' +

                    '<div class="circlebar btn-group annotator-btn-group hidden">' +

                    '<button type="button" id="tool-mode"' +
                    ' title="Back to Tools"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-remove"></i></button>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="move"' +
                    'data-edit="circle"' +
                    ' data-toggle="tooltip" data-placement="top" title="Move Circle">' +
                    '<i class="glyphicon glyphicon-fullscreen"></i></label>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="delete"' +
                    'data-edit="circle"' +
                    ' data-toggle="tooltip" data-placement="top" title="Delete Circle">' +
                    '<i class="glyphicon glyphicon-trash"></i></label>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="circle"' +
                    ' data-toggle="tooltip"' +
                    'data-placement="top" title="Write some text">' +
                    '<i class="glyphicon glyphicon-copyright-mark"></i>' +
                    '</label>' +

                    '</div>' +

                    '<div class="rectanglebar btn-group annotator-btn-group hidden">' +

                    '<button type="button" id="tool-mode"' +
                    ' title="Back to Tools"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-remove"></i></button>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="move"' +
                    'data-edit="rectangle"' +
                    ' data-toggle="tooltip" data-placement="top" title="Move Rectangle">' +
                    '<i class="glyphicon glyphicon-fullscreen"></i></label>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="delete"' +
                    'data-edit="rectangle"' +
                    ' data-toggle="tooltip" data-placement="top" title="Delete Rectangle">' +
                    '<i class="glyphicon glyphicon-trash"></i></label>' +

                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="rectangle"' +
                    ' data-toggle="tooltip" data-placement="top"' +
                    ' title="Draw an rectangle">' +
                    '<i class="glyphicon glyphicon-unchecked"></i>' +
                    '</label>' +

                    '</div>' +


                    '<div class="toolbar hidden" style="width:100%;">' +
                    '<div class="' + classPosition1 + '">';
                if (self.options.unselectTool) {
                    self.$tool += '<label class="btn btn-danger">' +
                        '<input type="radio" class="hidden" name="' + self.toolOptionId +
                        '" data-tool="null"' +
                        ' data-toggle="tooltip" data-placement="top"' +
                        ' title="No tool selected">' +
                        '<i class="glyphicon glyphicon-ban-circle"></i>' +
                        '</label>';
                }
                self.$tool +=
                    '<button type="button" id="mirror-h"' +
                    ' title="Mirror image horizontally"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-resize-horizontal"></i></button>' +

                    '<button type="button" id="mirror-v"' +
                    ' title="Mirror image vertically"' +
                    'class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-resize-vertical"></i></button>' +

                    '<button type="button" id="rotate-r"' +
                    ' title="Roate image right"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-repeat"></i></button>' +

                    '<button type="button" id="rotate-l"' +
                    ' title="Roate image left"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-repeat glyphicon-flip-h"></i></button>' +

                    '<button type="button" id="crop-mode"' +
                    ' title="CropMode"' +
                    ' class="btn btn-primary">' +
                    '<i class="glyphicon glyphicon-edit"></i></button>' +
                    '</div>' +

                    '<div class="pull-right ' + classPosition1 + '">' +
                    '<button type="button" id="rectangle-mode" class="btn btn-primary" data-tool="text"' +
                    'data-placement="top" title="Draw a Rectangle">' +
                    '<i class="glyphicon glyphicon-unchecked"></i></button>' +
                    '<button type="button" id="circle-mode" class="btn btn-primary" data-tool="text"' +
                    'data-placement="top" title="Draw a Circle">' +
                    '<i class="glyphicon glyphicon-copyright-mark"></i></button>' +
                    '<button type="button" id="arrow-mode" class="btn btn-primary" data-tool="text"' +
                    'data-placement="top" title="Draw an Arrow">' +
                    '<i class="glyphicon glyphicon-arrow-up"></i></button>' +
                    
                    '<label class="btn btn-primary">' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="pen"' +
                    ' data-toggle="tooltip" data-placement="top" title="Pen Tool">' +
                    '<i class="glyphicon glyphicon-pencil"></i></label>' +
                     
                    '<button type="button" id="text-mode" class="btn btn-primary" data-tool="text"' +
                    'data-placement="top" title="Write some text">' +
                    '<i class="glyphicon glyphicon-font"></i></button>' +

                    '</div></div>';
            } else {
                self.$tool = '<div id="" style="display:inline-block">' +
                    '<button id="undoaction">UNDO</button>';
                if (self.options.unselectTool) {
                    self.$tool += '<input type="radio" name="' + self.toolOptionId +
                        '" data-tool="null">NO TOOL SELECTED';
                }
                self.$tool += '<input type="radio" name="' + self.toolOptionId +
                    '" data-tool="rectangle" checked>RECTANGLE' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="circle">CIRCLE<input type="radio" name="' +
                    self.toolOptionId + '" data-tool="text"> TEXT' +
                    '<input type="radio" class="hidden" name="' + self.toolOptionId +
                    '" data-tool="arrow">ARROW<input type="radio" name="' +
                    self.toolOptionId + '" data-tool="pen">PEN' +
                    '<button id="redoaction"' +
                    'title="Redo the last undone annotation">REDO</button>' +
                    '</div>';
            }
            self.$tool = $(self.$tool);


            self.$undoTool = '<div class="undo_toolbar toolbar btn-group annotator-btn-group">' +
                '<button id="undoaction" title="Undo the last annotation"' +
                ' disabled="false"' +
                ' class="btn btn-primary ' + classPosition2 +
                ' annotate-undo">' +
                '<i class="glyphicon glyphicon-arrow-left"></i></button>' +
                '<button type="button" id="redoaction"' +
                ' title="Redo the last undone annotation"' +
                ' disabled="false"' +
                ' class="btn btn-primary ' + classPosition2 + ' annotate-redo">' +
                '<i class="glyphicon glyphicon-arrow-right"></i></button>' + '</div>';


            self.$undoTool = $(self.$undoTool);

            $('.annotate-container').append(self.$tool);
            $('.annotate-container').append(self.$undoTool);
            if (self.options.save_toolbar) {
                self.$saveTool = '<div class="save_toolbar toolbar btn-group annotator-btn-group pull-right">' +
                    '<a id="download" title=""' +
                    ' class="btn btn-primary ' + classPosition2 +
                    ' annotate-undo">' +
                    '<i class="glyphicon glyphicon-floppy-disk"></i></a>' +
                    '<button type="button" id="abbort"' +
                    ' title=""' +
                    ' class="btn btn-primary ' + classPosition2 + ' annotate-redo">' +
                    '<i class="glyphicon glyphicon-remove"></i></button>' +
                    '</div>';
                self.$saveTool = $(self.$saveTool);
                $('.annotate-container').append(self.$saveTool);
            }

            var canvasPosition = self.$el.offset();
            if (self.options.position === 'top' || self.options.position !==
                'top' && !self.options.bootstrap) {
                self.$tool.css({
                    position: 'absolute',
                    top: -53,
                    left: 0
                });
            } else if (self.options.position === 'left' && self.options.bootstrap) {
                self.$tool.css({
                    position: 'absolute',
                    top: canvasPosition.top - 53,
                    left: canvasPosition.left - 20
                });
            } else if (self.options.position === 'right' && self.options.bootstrap) {
                self.$tool.css({
                    position: 'absolute',
                    top: canvasPosition.top - 53,
                    left: canvasPosition.left + self.baseCanvas.width + 20
                });
            } else if (self.options.position === 'bottom' && self.options.bootstrap) {
                self.$tool.css({
                    position: 'absolute',
                    top: canvasPosition.top + self.baseCanvas.height + 53,
                    left: canvasPosition.left
                });
            }
            self.$textbox = $('<textarea wrap="off" id=""' +
                ' style="position:absolute;z-index:100000;display:none;top:0;left:0;' +
                'background:rgba(255,255,255,0.7);border:1px dotted; line-height:25px;' +
                ';font-size:' + self.fontsize + 'px' +
                ';resize: none' +
                ';font-family:Verdana;color:' + self.options.color +
                ';outline-width: 0;overflow: hidden;' +
                'padding:2px 5px"></textarea>');
            $('body').append(self.$textbox);

            self.$textbox.on('keyup keydown', function() {
                $(this).css('width', '0px');
                $(this).css('height', '0px');
                $(this).css('width', Math.max(15, this.scrollWidth + 5) + 'px');
                $(this).css('height', this.scrollHeight + 'px');
            });

            if (self.options.images) {
                self.initBackgroundImages();
            } else {
                if (!self.options.width && !self.options.height) {
                    self.options.width = 640;
                    self.options.height = 480;
                }
                self.baseCanvas.width = self.drawingCanvas.width = self.options.width;
                self.baseCanvas.height = self.drawingCanvas.height = self.options
                    .height;
            }
            self.$tool.on('change', 'input[name^="tool_option"]', function() {
                self.selectTool($(this));
            });
            $('[data-tool="' + self.options.type + '"]').trigger('click');
            self.$undoTool.on('click', '.annotate-redo', function(event) {
                self.redoaction(event);
            });

            self.$undoTool.on('click', '.annotate-undo', function(event) {
                self.undoaction(event);
            });

            self.$tool.on('click', '#mirror-h', function(event) {
                self.mirroraction(event, 'horizontal');
            });

            self.$tool.on('click', '#mirror-v', function(event) {
                self.mirroraction(event, 'vertical');
            });

            self.$tool.on('click', '#rotate-r', function(event) {
                self.rotateaction(event, 90);
            });

            self.$tool.on('click', '#rotate-l', function(event) {
                self.rotateaction(event, -90);
            });

            self.$tool.on('click', '#crop-mode', function(event) {
                self.goCropMode();
            });

            self.$tool.on('click', '#crop-ok', function(event) {
                self.addCropImage(event);
            });
            self.$tool.on('click', '#tool-mode', function(event) {
                self.goToolMode();
            });

            self.$tool.on('click', '#text-mode', function(event) {
                self.goTextMode();
            });

            self.$tool.on('click', '#arrow-mode', function(event) {
                self.goArrowMode();
            });

            self.$tool.on('click', '#circle-mode', function(event) {
                self.goCircleMode();
            });

            self.$tool.on('click', '#rectangle-mode', function(event) {
                self.goRectMode();
            });

            self.$saveTool.find("#download").click(function() {
                this.href = self.exportImage();
                this.download = 'img.jpg';
            });

            $(document).on(self.options.selectEvent, '.annotate-image-select',
                function(event) {
                    event.preventDefault();
                    var image = self.selectBackgroundImage($(this).attr(self.options
                        .idAttribute));
                    self.setBackgroundImage(image);
                });
            $('#' + self.drawingLayerId).on('mousedown touchstart', function(
                event) {
                self.annotatestart(event);
            });
            $('#' + self.drawingLayerId).on('mouseup touchend', function(event) {
                self.annotatestop(event);
            });
            // https://developer.mozilla.org/en-US/docs/Web/Events/touchleave
            $('#' + self.drawingLayerId).on('mouseleave touchleave', function(
                event) {
                self.annotateleave(event);
            });
            $('#' + self.drawingLayerId).on('mousemove touchmove', function(
                event) {
                self.annotatemove(event);
            });
            $(window).on('resize', function() {
                self.annotateresize();
            });

            if (self.options.initial_crop) {
                self.goCropMode();
            } else {
                self.goToolMode();
            }

            self.checkUndoRedo();
        },
        generateId: function(length) {
            var chars =
                '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split(
                    '');
            var charsLen = chars.length;
            if (!length) {
                length = Math.floor(Math.random() * charsLen);
            }
            var str = '';
            for (var i = 0; i < length; i++) {
                str += chars[Math.floor(Math.random() * charsLen)];
            }
            return str;
        },

        /* 
         * CROPPER
         */
        goCropMode: function() {
            var self = this;
            self.$tool.find('.toolbar').addClass("hidden");
            self.$tool.find('.cropbar').removeClass("hidden");
            self.options.type = null;
            self.mode = 'crop';
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            self.cropSelector = {
                x: 20,
                y: 20,
                w: 640,
                h: 480
            };
            /*if ((self.currentWidth/self.currentHeight) <= (4/3) ) {
                self.cropSelector.w = $canvas.width();
                self.cropSelector.h = ($canvas.width() / 4) * 3;
            } else {
                self.cropSelector.w = ($canvas.height() / 3) * 4;
                self.cropSelector.h = $canvas.height();
            }*/
            $canvas.bind("mousedown", { canvas: $canvas, self: self }, self.cropCheckDistanceToSelector);
            $canvas.bind("mouseup mouseleave", { canvas: $canvas, self: self }, self.clearListener);
            self.clear();
            self.redraw();
        },
        cropCheckDistanceToSelector: function(event) {
            var self = event.data.self;
            var $canvas = event.data.canvas;
            var rel_x = event.pageX - $canvas.offset().left;
            var rel_y = event.pageY - $canvas.offset().top;
            var threshhold = self.options.selector_threshhold;
            if ((self.cropSelector.x - threshhold <= rel_x && self.cropSelector.x + threshhold >= rel_x &&
                    self.cropSelector.y - threshhold <= rel_y && self.cropSelector.y + threshhold >= rel_y)) {
                $canvas.bind("mousemove", { canvas: $canvas, self: self, corner: 1, old: { x: self.cropSelector.x, y: self.cropSelector.y, w: self.cropSelector.w, h: self.cropSelector.h }, pos: { x: rel_x, y: rel_y } }, self.resizeCropSelect);
            } else if ((self.cropSelector.x + self.cropSelector.w - threshhold <= rel_x && self.cropSelector.x + self.cropSelector.w + threshhold >= rel_x &&
                    self.cropSelector.y + self.cropSelector.h - threshhold <= rel_y && self.cropSelector.y + self.cropSelector.h + threshhold >= rel_y)) {
                $canvas.bind("mousemove", { canvas: $canvas, self: self, corner: -1, old: { x: self.cropSelector.x, y: self.cropSelector.y, w: self.cropSelector.w, h: self.cropSelector.h }, pos: { x: rel_x, y: rel_y } }, self.resizeCropSelect);

            } else if (self.cropSelector.x <= rel_x &&
                self.cropSelector.x + self.cropSelector.w >= rel_x &&
                self.cropSelector.y <= rel_y &&
                self.cropSelector.y + self.cropSelector.h >= rel_y) {
                $canvas.bind("mousemove", { canvas: $canvas, self: self, dist: { x: self.cropSelector.x - rel_x, y: self.cropSelector.y - rel_y } }, self.moveCropSelect);
            }
        },
        resizeCropSelect: function(event) {
            var self = event.data.self;
            var $canvas = event.data.canvas;
            var rel_x = event.pageX - $canvas.offset().left;
            var rel_y = event.pageY - $canvas.offset().top;


            var n_x = event.data.old.x + Math.floor((rel_x - event.data.pos.x) * event.data.corner);
            var n_y = event.data.old.y + Math.floor((rel_y - event.data.pos.y) * event.data.corner);
            var n_w = event.data.old.w - 2 * Math.floor((rel_x - event.data.pos.x) * event.data.corner);
            var n_h = event.data.old.h - 2 * Math.floor((rel_y - event.data.pos.y) * event.data.corner)
                /*OUTER BOUNDS*/
            if (n_x < 0) {
                n_x = 0
                n_w = event.data.old.w + 2 * (event.data.old.x - n_x)
            };
            if (n_y < 0) {
                n_y = 0
                n_h = event.data.old.h + 2 * (event.data.old.y - n_y)
            };
            if (n_x + n_w > $canvas.width()) {
                n_x = event.data.old.x - ($canvas.width() - (event.data.old.x + event.data.old.w));
                n_w = event.data.old.w + 2 * ($canvas.width() - (event.data.old.x + event.data.old.w));
            }
            if (n_y + n_h > $canvas.width()) {
                n_y = event.data.old.y - ($canvas.height() - (event.data.old.y + event.data.old.h));
                n_h = event.data.old.h + 2 * ($canvas.height() - (event.data.old.y + event.data.old.h));
            }
            /*MIN SIZE*/
            if (n_w < self.cropSizeMinW) {
                n_w = self.cropSizeMinW;
                n_x = Math.floor((event.data.old.w - n_w) / 2) + event.data.old.x
            };
            if (n_h < self.cropSizeMinH) {
                n_h = self.cropSizeMinH;
                n_y = Math.floor((event.data.old.h - n_h) / 2) + event.data.old.y
            };
            self.cropSelector.x = n_x;
            self.cropSelector.y = n_y;
            self.cropSelector.w = n_w
            self.cropSelector.h = n_h;
            self.clear();
            self.redraw();
        },
        moveCropSelect: function(event) {
            var self = event.data.self;
            var $canvas = event.data.canvas;
            var rel_x = event.pageX - $canvas.offset().left;
            var rel_y = event.pageY - $canvas.offset().top;
            var n_x, n_y;
            if (event.data.dist.x + rel_x >= 0 &&
                event.data.dist.x + rel_x + self.cropSelector.w <= $canvas.width()) {
                n_x = event.data.dist.x + rel_x;
            } else if (event.data.dist.x + rel_x < 0) {
                n_x = 0;
            } else if (event.data.dist.x + rel_x + self.cropSelector.w > $canvas.width()) {
                n_x = $canvas.width() - self.cropSelector.w;
            }

            if (event.data.dist.y + rel_y >= 0 &&
                event.data.dist.y + rel_y + self.cropSelector.h <= $canvas.height()) {
                n_y = event.data.dist.y + rel_y;
            } else if (event.data.dist.y + rel_y < 0) {
                n_y = 0;
            } else if (event.data.dist.y + rel_y + self.cropSelector.h > $canvas.height()) {
                n_y = $canvas.height() - self.cropSelector.h;
            }
            self.cropSelector.x = n_x;
            self.cropSelector.y = n_y;
            self.clear();
            self.redraw();
        },
        drawSelector: function(ctx) {
            var self = this;
            var th = self.options.selector_threshhold;
            ctx.beginPath();
            ctx.rect(self.cropSelector.x, self.cropSelector.y, self.cropSelector.w, self.cropSelector.h);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#353535';
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.rect(self.cropSelector.x - th, self.cropSelector.y - th, 2 * th, 2 * th);
            ctx.rect(self.cropSelector.x + self.cropSelector.w - th, self.cropSelector.y + self.cropSelector.h - th, 2 * th, 2 * th);
            ctx.stroke();
            ctx.fillStyle = "rgba(70, 70, 70, 0.6)";
            ctx.fillRect(0, 0, self.cropSelector.x, self.currentHeight);
            ctx.fillRect(self.cropSelector.x + self.cropSelector.w, 0, self.currentWidth - (self.cropSelector.x + self.cropSelector.w), self.currentHeight);
            ctx.fillRect(self.cropSelector.x, 0, self.cropSelector.w, self.cropSelector.y);
            ctx.fillRect(self.cropSelector.x, self.cropSelector.y + self.cropSelector.h, self.cropSelector.w, self.currentHeight - (self.cropSelector.y + self.cropSelector.h));
            ctx.fillStyle = "rgba(210, 210, 210, 1)";
            ctx.fillRect(self.cropSelector.x - th, self.cropSelector.y - th, 2 * th, 2 * th);
            ctx.fillRect(self.cropSelector.x + self.cropSelector.w - th, self.cropSelector.y + self.cropSelector.h - th, 2 * th, 2 * th);
        },
        addCropImage: function(event) {
            var self = this;
            self.storedElement.push({
                type: 'crop',
                x: self.cropSelector.x,
                y: self.cropSelector.y,
                w: self.cropSelector.w,
                h: self.cropSelector.h
            })
            self.goToolMode();
        },
        /*
         * TEXTMODE
         */
        goTextMode: function() {
            var self = this;
            self.$tool.find('.toolbar').addClass("hidden");
            self.$tool.find('.textbar').removeClass("hidden");
            self.options.type = null;
            self.mode = 'text';
            self.setTool('text');
            self.clear();
            self.redraw();
        },
        /*
         * ARROWMODE
         */
        goArrowMode: function() {
            var self = this;
            self.$tool.find('.toolbar').addClass("hidden");
            self.$tool.find('.arrowbar').removeClass("hidden");
            self.options.type = null;
            self.mode = 'arrow';
            self.setTool('arrow');
            self.clear();
            self.redraw();
        },
        /*
         * Textmode
         */
        goCircleMode: function() {
            var self = this;
            self.$tool.find('.toolbar').addClass("hidden");
            self.$tool.find('.circlebar').removeClass("hidden");
            self.options.type = null;
            self.mode = 'circle';
            self.setTool('circle');
            self.clear();
            self.redraw();
        },
        goRectMode: function() {
            var self = this;
            self.$tool.find('.toolbar').addClass("hidden");
            self.$tool.find('.rectanglebar').removeClass("hidden");
            self.options.type = null;
            self.mode = 'rectangle';
            self.setTool('rectangle');
            self.clear();
            self.redraw();
        },
        goMoveMode: function(mode) {
            var self = this;
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            self.edit_mode = mode;
            $canvas.bind("mousedown", { canvas: $canvas, self: self }, self.moveModeMouseDown);
            self.clear();
            self.redraw();
        },
        leaveMoveMode: function() {
            var self = this;
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            self.edit_mode = '';
            $canvas.unbind("mousedown", self.moveModeMouseDown);
            self.clear();
            self.redraw();
        },
        moveModeMouseDown: function(event) {
            var self = event.data.self;
            var $canvas = event.data.canvas;
            var clickedElement = self.checkDistanceToElements(event);
            if (clickedElement) {
                var newElement = $.extend({}, clickedElement.element);
                newElement.deletes = clickedElement.index;
                newElement.fromx -= clickedElement.offset.x;
                newElement.fromy -= clickedElement.offset.y;
                if (newElement.type != 'text' && newElement.type != 'rectangle') {
                    newElement.tox -= clickedElement.offset.x;
                    newElement.toy -= clickedElement.offset.y;
                }
                self.storedElement[clickedElement.index].deleted = true;
                $canvas.bind("mouseup mouseleave", { canvas: $canvas, self: self, element: newElement }, self.stopMoveElement);
                $canvas.bind("mousemove", {
                        canvas: $canvas,
                        self: self,
                        element: newElement,
                        pos: { //Position of the Element in relation to the Cursor
                            x: newElement.fromx - clickedElement.rel.x,
                            y: newElement.fromy - clickedElement.rel.y,
                            tx: newElement.tox - clickedElement.rel.x,
                            ty: newElement.toy - clickedElement.rel.y
                        }
                    },
                    self.moveElement);
                self.redraw();
                self.drawElement(self.drawingContext, newElement);
            }
        },
        moveElement: function(event) {
            var self = event.data.self;
            var element = event.data.element;
            var $canvas = event.data.canvas;
            var rel_x = event.pageX - $canvas.offset().left;
            var rel_y = event.pageY - $canvas.offset().top;
            var n_x = 0,
                n_y = 0;
            n_x = event.data.pos.x + rel_x;
            n_y = event.data.pos.y + rel_y;
            element.fromx = n_x;
            element.fromy = n_y;
            if (element.type == 'rectangle') {
                element.tox = element.tox;
                element.toy = element.toy;
            } else if (element.type != 'text') {
                element.tox = event.data.pos.tx + rel_x;
                element.toy = event.data.pos.ty + rel_y;
            }
            self.clear();
            self.drawElement(self.drawingContext, element);

        },
        stopMoveElement: function(event) {
            var self = event.data.self;
            var $canvas = event.data.canvas;
            self.storedElement.push(event.data.element);
            self.redraw();
            $canvas.unbind("mousemove", self.moveElement);
            $canvas.unbind("mouseup mouseleave", self.stopMoveElement);
            self.clearListener(event);
        },
        goDeleteMode: function(mode) {
            var self = this;
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            self.edit_mode = mode;
            $canvas.bind("mouseup", { canvas: $canvas, self: self }, self.deleteModeEvent);
            self.clear();
            self.redraw();
        },
        leaveDeleteMode: function() {
            var self = this;
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            self.edit_mode = '';
            $canvas.unbind("mouseup", self.deleteModeEvent);
            self.clear();
            self.redraw();
        },
        deleteModeEvent: function(event) {
            var self = event.data.self;
            var $canvas = event.data.canvas;
            var clickedElement = self.checkDistanceToElements(event);
            if (clickedElement) {
                var deletedElement = { type: 'delete', deletes: clickedElement.index };
                self.storedElement.push(deletedElement);
                self.storedElement[clickedElement.index].deleted = true;
                self.clear();
                self.redraw();
            }
        },
        goEditMode: function(mode) {
            var self = this;
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            self.edit_mode = mode;
            $canvas.bind("mouseup", { canvas: $canvas, self: self }, self.editModeEvent);
            self.clear();
            self.redraw();
        },
        leaveEditMode: function() {
            var self = this;
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            self.edit_mode = '';
            $canvas.unbind("mouseup", self.editModeEvent);
            self.clear();
            self.redraw();
        },
        editModeEvent: function(event) {
            var self = event.data.self;
            var $canvas = event.data.canvas;
            var clickedElement = self.checkDistanceToElements(event);
            if (clickedElement) {
                self.storedElement[clickedElement.index].deleted = true;
                self.lastDeleted = clickedElement.index;
                self.$textbox.show().css({
                    left: clickedElement.element.fromx + $canvas.offset().left,
                    top: clickedElement.element.fromy + $canvas.offset().top,
                    width: clickedElement.element.width + 15,
                    height: clickedElement.element.height + 6
                }).val(clickedElement.element.text);
                window.setTimeout(function() { self.$textbox.focus() }, 500);
                self.redraw();
            }
        },
        checkDistanceToElements: function(event) {
            var self = this;
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            var rel_x = event.pageX - $canvas.offset().left;
            var rel_y = event.pageY - $canvas.offset().top;
            var crop_offset = { x: 0, y: 0 };

            for (var i = self.storedElement.length - 1; i >= 0; i--) {
                var element = self.storedElement[i];
                if (element.deleted) {
                    continue;
                }
                if (element && element.type == 'crop') {
                    crop_offset.x += element.x;
                    crop_offset.y += element.y;
                }
                var x_min, y_min, x_max, y_max;
                if (element && element.type == self.edit_mode && element.type == 'text') {
                    x_min = element.fromx - crop_offset.x;
                    y_min = element.fromy - crop_offset.y;
                    x_max = element.fromx - crop_offset.x + element.width;
                    y_max = element.fromy - crop_offset.y + element.height;
                } else if (element && element.type == self.edit_mode && element.type == 'rectangle') {
                    x_min = Math.min(element.fromx - crop_offset.x, element.tox + element.fromx - crop_offset.x);
                    y_min = Math.min(element.fromy - crop_offset.y, element.toy + element.fromy - crop_offset.y);
                    x_max = Math.max(element.fromx - crop_offset.x, element.tox + element.fromx - crop_offset.x);
                    y_max = Math.max(element.fromy - crop_offset.y, element.toy + element.fromy - crop_offset.y);
                } else if (element && element.type == self.edit_mode) {
                    x_min = Math.min(element.fromx - crop_offset.x, element.tox - crop_offset.x);
                    y_min = Math.min(element.fromy - crop_offset.y, element.toy - crop_offset.y);
                    x_max = Math.max(element.fromx - crop_offset.x, element.tox - crop_offset.x);
                    y_max = Math.max(element.fromy - crop_offset.y, element.toy - crop_offset.y);
                }
                if (x_min <= rel_x &&
                    x_max >= rel_x &&
                    y_min <= rel_y &&
                    y_max >= rel_y) {
                    return {
                        element: element, // The Element
                        index: i, // The Index of the Element 
                        offset: crop_offset, // What Offset the Element was Moved
                        rel: { x: rel_x, y: rel_y }
                    }; // Position of the Cursor
                }
            }
        },
        clearListener: function(event) {
            var self = event.data.self;
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            if (self.mode == 'crop') {
                $canvas.unbind("mousemove", self.resizeCropSelect);
                $canvas.unbind("mousemove", self.moveCropSelect);
            } else {
                $canvas.unbind("mouseup mouseleave", self.stopMoveElement);
            }
        },
        goToolMode: function() {
            var self = this;
            self.mode = 'tool';
            self.$tool.find('.toolbar').removeClass("hidden");
            self.$tool.find('.cropbar').addClass("hidden");
            self.$tool.find('.textbar').addClass("hidden");
            self.$tool.find('.arrowbar').addClass("hidden");
            self.$tool.find('.circlebar').addClass("hidden");
            self.$tool.find('.rectanglebar').addClass("hidden");
            var $canvas = self.$el.find('#' + self.drawingLayerId);
            $canvas.unbind("mousedown", self.cropCheckDistanceToSelector);
            $canvas.unbind("mouseup mouseleave", self.clearListener);
            self.storedUndo = [];
            self.setTool('', '');
            self.checkUndoRedo();
            self.clear();
            self.redraw();
        },
        addElements: function(newStoredElements, set, callback) {
            var self = this;
            this.storedElement = newStoredElements;
            //console.log('DJ: Adding new annotations'); 
            self.clear();
            self.redraw();

        },
        pushImage: function(newImage, set, callback) {
            var self = this;
            var id = null;
            var path = null;
            if (typeof newImage === 'object') {
                id = newImage.id;
                path = newImage.path;
            } else {
                id = newImage;
                path = newImage;
            }
            if (id === '' || typeof id === 'undefined' || self.selectBackgroundImage(
                    id)) {
                id = self.generateId(10);
                while (self.selectBackgroundImage(id)) {
                    id = self.generateId(10);
                }
            }
            var image = {
                id: id,
                path: path,
                storedUndo: [],
                storedElement: []
            };
            self.images.push(image);
            if (set) {
                self.setBackgroundImage(image);
            }
            if (callback) {
                callback({
                    id: image.id,
                    path: image.path
                });
            }
            self.$el.trigger('annotate-image-added', [
                image.id,
                image.path
            ]);
        },
        initBackgroundImages: function() {
            var self = this;
            $.each(self.options.images, function(index, image) {
                var set = false;
                if (index === 0) {
                    set = true;
                }
                self.pushImage(image, set);
            });
        },
        selectBackgroundImage: function(id) {
            var self = this;
            var image = $.grep(self.images, function(element) {
                return element.id === id;
            })[0];
            return image;
        },
        setBackgroundImage: function(image) {
            var self = this;
            if (self.$textbox.is(':visible')) {
                self.pushText();
            }
            var currentImage = self.selectBackgroundImage(self.selectedImage);
            if (currentImage) {
                currentImage.storedElement = self.storedElement;
                currentImage.storedUndo = self.storedUndo;
            }
            self.img = new Image();
            self.img.setAttribute('crossOrigin', 'anonymous');
            self.img.src = image.path;
            self.img.onload = function() {
                if ((self.options.width && self.options.height) !== undefined ||
                    (self.options.width && self.options.height) !== 0) {
                    self.img.setAttribute('crossOrigin', 'anonymous');
                    self.img_width = self.currentWidth = this.width;
                    self.img_height = self.currentHeight = this.height;
                    self.selectImageSize.width = this.width;
                    self.selectImageSize.height = this.height;
                } else {
                    self.currentWidth = self.options.width;
                    self.currentHeight = self.options.height;
                }

                if (self.options.max_width > 0 &&
                    self.currentWidth > self.options.max_width) {
                    self.scale = self.options.max_width / self.currentWidth;
                    self.currentWidth = self.options.max_width;
                    self.currentHeight = self.currentHeight * self.scale;
                }

                self.baseCanvas.width = self.drawingCanvas.width = self.currentWidth;
                self.baseCanvas.height = self.drawingCanvas.height = self.currentHeight;
                self.baseContext.drawImage(self.img, 0, 0, self.img_width, self.img_height, 0, 0, self.currentWidth,
                    self.currentHeight);
                self.$el.css({
                    height: self.currentHeight,
                    width: self.currentWidth
                });
                self.$el.find(".canvas-container").css({ height: self.currentHeight });
                self.storedElement = image.storedElement;
                self.storedUndo = image.storedUndo;
                self.selectedImage = image.id;
                self.checkUndoRedo();
                self.clear();
                self.redraw();
                self.annotateresize();
            };
        },
        checkUndoRedo: function() {
            var self = this;
            self.$undoTool.children('#redoaction').attr('disabled', self.storedUndo
                .length === 0);
            self.$undoTool.children('#undoaction').attr('disabled', self.storedElement
                .length === 0);
        },
        undoaction: function(event) {
            event.preventDefault();
            var self = this;
            var index = self.storedElement.length - 1;
            if (self.storedElement[index].deletes != null) {
                self.storedElement[self.storedElement[index].deletes].deleted = false;
            }
            self.storedUndo.push(self.storedElement[index]);
            self.storedElement.pop();
            self.checkUndoRedo();
            self.clear();
            self.redraw();
        },
        redoaction: function(event) {
            event.preventDefault();
            var self = this;
            var index = self.storedUndo.length - 1;
            if (self.storedUndo[index].deletes != null) {
                self.storedElement[self.storedUndo[index].deletes].deleted = true;
            }
            self.storedElement.push(self.storedUndo[self.storedUndo.length - 1]);
            self.storedUndo.pop();
            self.checkUndoRedo();
            self.clear();
            self.redraw();
        },
        mirroraction: function(event, orientation) {
            event.preventDefault();
            var self = this;
            self.storedElement.push({
                type: 'mirror',
                orientation: orientation
            });
            if (self.storedUndo.length > 0) {
                self.storedUndo = [];
            }
            self.checkUndoRedo();
            self.redraw();
        },
        rotateaction: function(event, degree) {
            event.preventDefault();
            var self = this;
            self.storedElement.push({
                type: 'rotate',
                degree: degree
            });
            if (self.storedUndo.length > 0) {
                self.storedUndo = [];
            }
            self.checkUndoRedo();
            self.redraw();
        },
        redraw: function() {
            var self = this;
            self.baseCanvas.width = self.drawingCanvas.width = self.currentWidth;
            self.baseCanvas.height = self.drawingCanvas.height = self.currentHeight;

            var mirror_v = 1;
            var mirror_h = 1;
            var rotation = 0;
            var crop = {
                x: 0,
                y: 0,
                w: self.currentWidth,
                h: self.currentHeight,
                nonstandard: false
            };
            var crop_array_holder = [];
            for (var i = 0; i < self.storedElement.length; i++) {
                var element = self.storedElement[i];
                switch (element.type) {
                    case 'mirror':
                        if (element.orientation == 'vertical') { mirror_v = -1 * mirror_v; } else if (element.orientation == 'horizontal') { mirror_h = -1 * mirror_h; }
                        break;
                    case 'rotate':
                        rotation = rotation + element.degree;
                        break;
                    case 'crop':
                        crop.x = crop.x + element.x;
                        crop.y = crop.y + element.y;
                        crop.w = element.w;
                        crop.h = element.h;
                        crop.nonstandard = true;
                        crop_array_holder.push(i);
                        //Spiegelung zum Zeitpunkt des Crops beachten
                        if (mirror_h == -1) { crop.x = self.currentWidth - crop.x - crop.w; }
                        if (mirror_v == -1) { crop.y = self.currentHeight - crop.y - crop.h; }
                        break;
                }
            }
            if (crop.nonstandard) {
                self.baseCanvas.width = self.drawingCanvas.width = crop.w;
                self.baseCanvas.height = self.drawingCanvas.height = crop.h;
                /*self.$el.css({
                  height: crop.h,
                  width: crop.w
                });*/
            }

            self.baseContext.save();

            self.baseContext.translate(crop.w / 2, crop.h / 2);
            //Mirror Image
            self.baseContext.scale(mirror_h, mirror_v);


            //Rotate Immage
            if (rotation != 0) {
                self.baseContext.rotate(rotation * Math.PI / 180);
                /* Recalculate Height and Width? Also for Crop
                 * if (rotation%180 != 0) {
                  console.log("SDA")  
                }*/
            }

            if (self.options.images) {
                self.baseContext.drawImage(self.img, crop.x / self.scale, crop.y / self.scale, crop.w / self.scale, crop.h / self.scale, -crop.w / 2, -crop.h / 2,
                    crop.w, crop.h);
            }
            self.baseContext.restore();

            if (self.mode == 'crop') {
                self.drawSelector(self.drawingContext);
            }

            if (self.storedElement.length === 0) {
                return;
            }
            // clear each stored line

            var crop_position = 0;
            for (var i = 0; i < self.storedElement.length; i++) {
                var element = self.storedElement[i];
                if (element.deleted) {
                    continue;
                }
                var crop_offset = { x: 0, y: 0 };
                if (crop_position < crop_array_holder.length) {
                    if (crop_array_holder[crop_position] <= i) {
                        crop_position++;
                    }
                    for (var j = crop_position; j < crop_array_holder.length; j++) {
                        crop_offset.x += self.storedElement[crop_array_holder[j]].x;
                        crop_offset.y += self.storedElement[crop_array_holder[j]].y;
                    }
                }
                self.drawElement(self.baseContext, element, crop_offset);
            }
        },
        drawElement: function(context, element, offset) {
            var self = this;
            var offset = offset ? offset : { x: 0, y: 0 };
            switch (element.type) {
                case 'rectangle':
                    self.drawRectangle(context, element.fromx - offset.x, element.fromy - offset.y,
                        element.tox, element.toy);
                    break;
                case 'arrow':
                    self.drawArrow(context, element.fromx - offset.x, element.fromy - offset.y,
                        element.tox - offset.x, element.toy - offset.y);
                    break;
                case 'pen':
                    for (var b = 0; b < element.points.length - 1; b++) {
                        var fromx = element.points[b][0];
                        var fromy = element.points[b][1];
                        var tox = element.points[b + 1][0];
                        var toy = element.points[b + 1][1];
                        self.drawPen(context, fromx - offset.x, fromy - offset.y, tox - offset.x, toy - offset.y);
                    }
                    break;
                case 'text':
                    self.drawText(context, element.text, element.fromx - offset.x,
                        element.fromy - offset.y, element.width, element.height);
                    break;
                case 'circle':
                    self.drawCircle(context, element.fromx - offset.x, element.fromy - offset.y,
                        element.tox - offset.x, element.toy - offset.y);
                    break;
                default:
            }
        },
        clear: function() {
            var self = this;
            // Clear Canvas
            self.drawingCanvas.width = self.drawingCanvas.width;
        },
        drawRectangle: function(context, x, y, w, h) {
            var self = this;
            context.beginPath();
            context.rect(x, y, w, h);
            context.fillStyle = 'transparent';
            context.fill();
            context.lineWidth = self.linewidth * self.scale;
            context.strokeStyle = self.options.color;
            context.stroke();
        },
        drawCircle: function(context, x1, y1, x2, y2) {
            var radiusX = (x2 - x1) * 0.5;
            var radiusY = (y2 - y1) * 0.5;
            var centerX = x1 + radiusX;
            var centerY = y1 + radiusY;
            var step = 0.05;
            var a = step;
            var pi2 = Math.PI * 2 - step;
            var self = this;
            context.beginPath();
            if (self.edit_mode == "circle") {
                context.fillStyle = "rgba(70, 70, 70, 0.4)";
                context.fillRect(x1, y1, x2 - x1, y2 - y1);
            }
            context.moveTo(centerX + radiusX * Math.cos(0), centerY + radiusY *
                Math.sin(0));
            for (; a < pi2; a += step) {
                context.lineTo(centerX + radiusX * Math.cos(a), centerY + radiusY *
                    Math.sin(a));
            }
            context.lineWidth = self.linewidth * self.scale;
            context.strokeStyle = self.options.color;
            context.closePath();
            context.stroke();
        },
        drawArrow: function(context, x, y, w, h) {
            var self = this;
            var angle = Math.atan2(h - y, w - x);
            if (self.edit_mode == "arrow") {
                context.fillStyle = "rgba(70, 70, 70, 0.4)";
                context.fillRect(x, y, w - x, h - y);
            }
            context.beginPath();
            context.lineWidth = self.linewidth * self.scale;
            context.moveTo(x, y);
            context.lineTo(w, h);
            context.moveTo(w - self.linewidth * 5 * Math.cos(angle + Math.PI /
                6) * self.scale, h - self.linewidth * 5 * Math.sin(angle + Math.PI / 6) * self.scale);
            context.lineTo(w, h);
            context.lineTo(w - self.linewidth * 5 * Math.cos(angle - Math.PI /
                6) * self.scale, h - self.linewidth * 5 * Math.sin(angle - Math.PI / 6) * self.scale);
            context.strokeStyle = self.options.color;
            context.stroke();
        },
        drawPen: function(context, fromx, fromy, tox, toy) {
            var self = this;
            context.lineWidth = self.linewidth;
            context.moveTo(fromx, fromy);
            context.lineTo(tox, toy);
            context.strokeStyle = self.options.color;
            context.stroke();
        },
        wrapText: function(drawingContext, lines, x, y, lineheight) {
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                drawingContext.fillText(line, x, y + i * lineheight);
            }
        },
        drawText: function(context, text, x, y, width, height) {
            var self = this;
            var lines = text.split('\n');

            context.beginPath();
            context.rect(x, y, width + 15, height + 6);
            context.fillStyle = self.options.textbox_bg_color;
            context.fill();
            context.lineWidth = self.linewidth * self.scale;
            context.strokeStyle = self.options.color;
            context.stroke();
            context.font = (self.fontsize * self.scale) + 'px' + ' Verdana';
            context.textBaseline = 'top';
            context.fillStyle = self.options.color;

            self.wrapText(context, lines, x + 7, y + 3, self.lineheight);
        },
        pushText: function() {
            var self = this;
            var text = self.$textbox.val();
            var fromx = self.$textbox.offset().left - self.$el.find('#' + self.drawingLayerId).offset().left;
            var fromy = self.$textbox.offset().top - self.$el.find('#' + self.drawingLayerId).offset().top;
            self.$textbox.val('').hide();
            if (text || self.options.type == "edit") {
                var elem = {};
                var store = false;
                if (text) {
                    elem = {
                        type: 'text',
                        text: text,
                        fromx: fromx,
                        fromy: fromy,
                        width: self.$textbox.width(),
                        height: self.$textbox.height()
                    }
                    if (self.options.type == "edit") {
                        elem.deletes = self.lastDeleted;
                    }
                    store = true;
                };
                if (self.options.type == "edit" && !store) {
                    self.storedElement[self.lastDeleted].deleted = false;
                }
                if (store) {
                    self.storedElement.push(elem);
                    if (self.storedUndo.length > 0) {
                        self.storedUndo = [];
                    }
                }
            }
            self.checkUndoRedo();
            self.redraw();
        },
        getTextBounds: function(drawingContext, element) {
            if (element.type != 'text') return false;
            var self = this;
            var lines = element.text.split('\n');
            var width = 0;
            var height = 0;
            for (var i = 0; i < lines.length; i++) {
                var metrics = drawingContext.measureText(lines[i]);
                width = Math.max(metrics.width, width)
            }
            height = (lines.length * self.lineheight / self.scale) + 5;
            return {
                w: (width > element.maxwidth ? element.maxwidth + 14 : width + 14),
                max_w: element.maxwidth + 14,
                h: height
            };
        },
        setTool: function(tool, mode) {
            var self = this;
            var $radios = $("input:radio[name='" + self.toolOptionId + "']");
            var current = $radios.filter(":checked");
            var toActivate = tool != '' ? $radios.filter("[data-tool='" + tool + "']") : false;
            $radios.each(function(i) { $(this).parent().removeClass('active') })
            current.prop('checked', false);
            if (toActivate) {
                toActivate.prop('checked', true);
                toActivate.parent().addClass('active');
            }

            if (self.options.type == 'text' ||
                (self.options.type == 'edit' && self.edit_mode == 'text')) {
                self.pushText();
            }
            self.options.type = tool;
            self.leaveMoveMode();
            self.leaveDeleteMode();
            self.leaveEditMode();
            if (tool == 'move' && mode && mode != '') {
                self.goMoveMode(mode);
            } else if (tool == 'delete' && mode && mode != '') {
                self.goDeleteMode(mode);
            } else if (tool == 'edit' && mode && mode != '') {
                self.goEditMode(mode);
            }
        },
        // Events
        selectTool: function(element) {
            var self = this;
            self.setTool(element.data('tool'), element.data('edit'));
        },
        annotatestart: function(event) {
            var self = this;
            self.clicked = true;
            var offset = self.$el.offset();
            if (self.$textbox.is(':visible')) {
                self.pushText();
            }
            self.tox = null;
            self.toy = null;
            self.points = [];
            var pageX = event.pageX || event.originalEvent.touches[0].pageX;
            var pageY = event.pageY || event.originalEvent.touches[0].pageY;
            self.fromx = (pageX - offset.left) * self.compensationWidthRate * self.scale;
            self.fromy = (pageY - offset.top) * self.compensationWidthRate * self.scale;
            self.fromxText = pageX;
            self.fromyText = pageY;
            if (self.options.type === 'text') {
                self.$textbox.css({
                    left: self.fromxText + 2,
                    top: self.fromyText,
                    width: 15,
                    height: self.lineheight + 4
                }).show();
                window.setTimeout(function() { self.$textbox.focus() }, 500);
            }
            if (self.options.type === 'pen') {
                self.points.push([
                    self.fromx,
                    self.fromy
                ]);
            }
        },
        annotatestop: function() {
            var self = this;
            self.clicked = false;
            if (self.toy !== null && self.tox !== null) {
                switch (self.options.type) {
                    case 'rectangle':
                        self.storedElement.push({
                            type: 'rectangle',
                            fromx: self.fromx,
                            fromy: self.fromy,
                            tox: self.tox,
                            toy: self.toy
                        });
                        break;
                    case 'circle':
                        self.storedElement.push({
                            type: 'circle',
                            fromx: self.fromx,
                            fromy: self.fromy,
                            tox: self.tox,
                            toy: self.toy
                        });
                        break;
                    case 'arrow':
                        self.storedElement.push({
                            type: 'arrow',
                            fromx: self.fromx,
                            fromy: self.fromy,
                            tox: self.tox,
                            toy: self.toy
                        });
                        break;
                    case 'text':
                        self.$textbox.css({
                            left: self.fromxText + 2,
                            top: self.fromyText
                        });
                        self.$textbox.focus();
                        break;
                    case 'pen':
                        self.storedElement.push({
                            type: 'pen',
                            points: self.points
                        });
                        for (var i = 0; i < self.points.length - 1; i++) {
                            self.fromx = self.points[i][0];
                            self.fromy = self.points[i][1];
                            self.tox = self.points[i + 1][0];
                            self.toy = self.points[i + 1][1];
                            self.drawPen(self.baseContext, self.fromx, self.fromy, self
                                .tox,
                                self.toy);
                        }
                        self.points = [];
                        break;
                    default:
                }
                if (self.storedUndo.length > 0) {
                    self.storedUndo = [];
                }
                self.checkUndoRedo();
                self.redraw();
            } else if (self.options.type === 'text') {
                self.$textbox.css({
                    left: self.fromxText + 2,
                    top: self.fromyText,
                    width: 15,
                    height: self.lineheight + 4
                });
            }
        },
        annotateleave: function(event) {
            var self = this;
            if (self.clicked) {
                self.annotatestop(event);
            }
        },
        annotatemove: function(event) {
            var self = this;
            if (self.options.type) {
                event.preventDefault();
            }
            if (!self.clicked) {
                return;
            }
            var offset = self.$el.offset();
            var pageX = event.pageX || event.originalEvent.touches[0].pageX;
            var pageY = event.pageY || event.originalEvent.touches[0].pageY;
            switch (self.options.type) {
                case 'rectangle':
                    self.clear();
                    self.tox = (pageX - offset.left) * self.scale * self.compensationWidthRate -
                        self.fromx;
                    self.toy = (pageY - offset.top) * self.scale * self.compensationWidthRate -
                        self.fromy;
                    self.drawRectangle(self.drawingContext, self.fromx, self.fromy,
                        self.tox, self.toy);
                    break;
                case 'arrow':
                    self.clear();
                    self.tox = (pageX - offset.left) * self.compensationWidthRate * self.scale;
                    self.toy = (pageY - offset.top) * self.compensationWidthRate * self.scale;
                    self.drawArrow(self.drawingContext, self.fromx, self.fromy,
                        self.tox,
                        self.toy);
                    break;
                case 'pen':
                    self.tox = (pageX - offset.left) * self.compensationWidthRate * self.scale;
                    self.toy = (pageY - offset.top) * self.compensationWidthRate * self.scale;
                    self.fromx = self.points[self.points.length - 1][0];
                    self.fromy = self.points[self.points.length - 1][1];
                    self.points.push([
                        self.tox,
                        self.toy
                    ]);
                    self.drawPen(self.drawingContext, self.fromx, self.fromy, self.tox,
                        self.toy);
                    break;
                case 'text':
                    self.clear();
                    self.tox = (pageX - self.fromxText) * self.compensationWidthRate * self.scale;
                    self.toy = (pageY - self.fromyText) * self.compensationWidthRate * self.scale;
                    break;
                case 'circle':
                    self.clear();
                    self.tox = (pageX - offset.left) * self.compensationWidthRate * self.scale;
                    self.toy = (pageY - offset.top) * self.compensationWidthRate * self.scale;
                    self.drawCircle(self.drawingContext, self.fromx, self.fromy,
                        self
                        .tox, self.toy);
                    break;
                default:
            }
        },
        annotateresize: function() {
            var self = this;
            var currentWidth = self.$el.width();
            var currentcompensationWidthRate = self.compensationWidthRate;
            self.compensationWidthRate = self.selectImageSize.width /
                currentWidth;
            if (self.compensationWidthRate < 1) {
                self.compensationWidthRate = 1;
            }
            self.linewidth = self.options.linewidth * self.compensationWidthRate;
            self.fontsize = self.options.fontsize * self.compensationWidthRate;
            if (currentcompensationWidthRate !== self.compensationWidthRate) {
                self.redraw();
                self.clear();
            }
        },
        destroy: function() {
            var self = this;
            $(document).off(self.options.selectEvent, '.annotate-image-select');
            self.$tool.remove();
            self.$textbox.remove();
            self.$el.children('canvas').remove();
            self.$el.removeData('annotate');
        },
        exportImage: function(options, callback) {
            var self = this;
            if (self.$textbox.is(':visible')) {
                self.pushText();
            }
            var exportDefaults = {
                type: 'image/jpeg',
                quality: 0.75
            };
            options = $.extend({}, exportDefaults, options);
            var image = self.baseCanvas.toDataURL(options.type, options.quality);
            if (callback) {
                callback(image);
            }
            self.options.onExport(image);
            return image;
        }
    };
    $.fn.annotate = function(options, cmdOption, callback) {
        var $annotate = $(this).data('annotate');
        if (options === 'destroy') {
            if ($annotate) {
                $annotate.destroy();
            } else {
                throw new Error('No annotate initialized for: #' + $(this).attr(
                    'id'));
            }
        } else if (options === 'push') {
            if ($annotate) {
                $annotate.pushImage(cmdOption, true, callback);
            } else {
                throw new Error('No annotate initialized for: #' + $(this).attr(
                    'id'));
            }

        } else if (options === 'fill') {
            if ($annotate) {
                $annotate.addElements(cmdOption, true, callback);
            } else {
                throw new Error('No annotate initialized for: #' + $(this).attr(
                    'id'));
            }

        } else if (options === 'export') {
            if ($annotate) {
                $annotate.exportImage(cmdOption, callback);
            } else {
                throw new Error('No annotate initialized for: #' + $(this).attr(
                    'id'));
            }
        } else {
            var opts = $.extend({}, $.fn.annotate.defaults, options);
            var annotate = new Annotate($(this), opts);
            $(this).data('annotate', annotate);
        }
    };
    $.fn.annotate.defaults = {
        width: null,
        height: null,
        images: [],
        color: 'red',
        initial_crop: false,
        default_type: 'pen',
        type: '',
        linewidth: 2,
        fontsize: 20,
        lineheight_bous: 5,
        textbox_bg_color: 'white',
        bootstrap: false,
        position: 'top',
        idAttribute: 'id',
        selectEvent: 'change',
        unselectTool: false,
        selector_threshhold: 6,
        max_width: 1024,
        save_toolbar: true,
        onExport: function(image) {
            //console.log(image);
        }
    };
})(jQuery);