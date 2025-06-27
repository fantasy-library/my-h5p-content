var H5P = H5P || {};

/**
 * Constructor.
 *
 * @param {Object} params Options for this library.
 * @param {Number} id Content identifier
 * @returns {undefined}
 */
(function ($) {
  H5P.Image = function (params, id, extras) {
    H5P.EventDispatcher.call(this);
    this.extras = extras;

    if (params.file === undefined || !(params.file instanceof Object)) {
      this.placeholder = true;
    }
    else {
      this.source = H5P.getPath(params.file.path, id);
      this.width = params.file.width;
      this.height = params.file.height;
    }

    this.alt = (!params.decorative && params.alt !== undefined) ?
      this.stripHTML(this.htmlDecode(params.alt)) :
      '';

    if (params.title !== undefined) {
      this.title = this.stripHTML(this.htmlDecode(params.title));
    }
  };

  H5P.Image.prototype = Object.create(H5P.EventDispatcher.prototype);
  H5P.Image.prototype.constructor = H5P.Image;

  /**
   * Wipe out the content of the wrapper and put our HTML in it.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  H5P.Image.prototype.attach = function ($wrapper) {
    var self = this;
    var source = this.source;

    if (self.$img === undefined) {
      if(self.placeholder) {
        self.$img = $('<div>', {
          width: '100%',
          height: '100%',
          class: 'h5p-placeholder',
          title: this.title === undefined ? '' : this.title,
          on: {
            load: function () {
              self.trigger('loaded');
            }
          }
        });
      } else {
        self.$img = $('<img>', {
          width: '100%',
          height: '100%',
          src: source,
          alt: this.alt,
          title: this.title === undefined ? '' : this.title,
          on: {
            load: function () {
              self.trigger('loaded');
            }
          }
        });
      }
    }

    $wrapper.addClass('h5p-image').html(self.$img);
  };

  /**
   * Retrieve decoded HTML encoded string.
   *
   * @param {string} input HTML encoded string.
   * @returns {string} Decoded string.
   */
  H5P.Image.prototype.htmlDecode = function (input) {
    const dparser = new DOMParser().parseFromString(input, 'text/html');
    return dparser.documentElement.textContent;
  };

  /**
   * Retrieve string without HTML tags.
   *
   * @param {string} input Input string.
   * @returns {string} Output string.
   */
  H5P.Image.prototype.stripHTML = function (html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return H5P.Image;
}(H5P.jQuery));
;var H5P = H5P || {};

/**
 * Shape module
 *
 * @param {jQuery} $
 */
H5P.Shape = (function ($) {
  /**
   * Initialize module.
   *
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {C} self
   */
  function C(params, id) {
    H5P.EventDispatcher.call(this);
    this.params = $.extend(true, {
      type: 'rectangle',
      shape: {
        fillColor: '#ccc',
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: '#000',
        borderRadius: 0
      }
    }, params);
    this.contentId = id;
  }

  C.prototype = Object.create(H5P.EventDispatcher.prototype);
  C.prototype.constructor = C;

  /**
   * Attach h5p inside the given container.
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    this.$inner = $container.addClass('h5p-shape');
    this.$shape = $('<div class="h5p-shape-element h5p-shape-' + this.params.type + '"></div>');
    this.styleShape();
    this.$shape.appendTo(this.$inner);
  };

  /**
   * Is this a line?
   * @return {boolean}
   */
  C.prototype.isLine = function () {
    return this.params.type === 'vertical-line' ||
           this.params.type === 'horizontal-line';
  };

  /**
   * Style the shape
   */
  C.prototype.styleShape = function () {
    var props = this.isLine() ? this.params.line : this.params.shape;
    var borderWidth = (props.borderWidth * 0.0835) + 'em';
    var css = {
      'border-color': props.borderColor
    };

    if (this.params.type == "vertical-line") {
      css['border-left-width'] = borderWidth;
      css['border-left-style'] = props.borderStyle;
      this.trigger('set-size', {width: borderWidth, maxWidth: borderWidth});
    }
    else if (this.params.type == "horizontal-line") {
      css['border-top-width'] = borderWidth;
      css['border-top-style'] = props.borderStyle;
      this.trigger('set-size', {height: borderWidth, maxHeight: borderWidth});
    }
    else {
      css['background-color'] = props.fillColor;
      css['border-width'] = borderWidth;
      css['border-style'] = props.borderStyle;
    }

    if (this.params.type == "rectangle") {
      css['border-radius'] = props.borderRadius * 0.25 + 'em';
    }

    this.$shape.css(css);
  };

  return C;
})(H5P.jQuery);
;H5P.AdvancedText = (function ($, EventDispatcher) {

  /**
   * A simple library for displaying text with advanced styling.
   *
   * @class H5P.AdvancedText
   * @param {Object} parameters
   * @param {Object} [parameters.text='New text']
   * @param {number} id
   */
  function AdvancedText(parameters, id) {
    var self = this;
    EventDispatcher.call(this);

    var html = (parameters.text === undefined ? '<em>New text</em>' : parameters.text);

    /**
     * Wipe container and add text html.
     *
     * @alias H5P.AdvancedText#attach
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      $container.addClass('h5p-advanced-text').html(html);
    };
  }

  AdvancedText.prototype = Object.create(EventDispatcher.prototype);
  AdvancedText.prototype.constructor = AdvancedText;

  return AdvancedText;

})(H5P.jQuery, H5P.EventDispatcher);
;var H5P = H5P || {};
/**
 * Transition contains helper function relevant for transitioning
 */
H5P.Transition = (function ($) {

  /**
   * @class
   * @namespace H5P
   */
  Transition = {};

  /**
   * @private
   */
  Transition.transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'transition':       'transitionend',
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  /**
   * @private
   */
  Transition.cache = [];

  /**
   * Get the vendor property name for an event
   *
   * @function H5P.Transition.getVendorPropertyName
   * @static
   * @private
   * @param  {string} prop Generic property name
   * @return {string}      Vendor specific property name
   */
  Transition.getVendorPropertyName = function (prop) {

    if (Transition.cache[prop] !== undefined) {
      return Transition.cache[prop];
    }

    var div = document.createElement('div');

    // Handle unprefixed versions (FF16+, for example)
    if (prop in div.style) {
      Transition.cache[prop] = prop;
    }
    else {
      var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
      var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

      if (prop in div.style) {
        Transition.cache[prop] = prop;
      }
      else {
        for (var i = 0; i < prefixes.length; ++i) {
          var vendorProp = prefixes[i] + prop_;
          if (vendorProp in div.style) {
            Transition.cache[prop] = vendorProp;
            break;
          }
        }
      }
    }

    return Transition.cache[prop];
  };

  /**
   * Get the name of the transition end event
   *
   * @static
   * @private
   * @return {string}  description
   */
  Transition.getTransitionEndEventName = function () {
    return Transition.transitionEndEventNames[Transition.getVendorPropertyName('transition')] || undefined;
  };

  /**
   * Helper function for listening on transition end events
   *
   * @function H5P.Transition.onTransitionEnd
   * @static
   * @param  {domElement} $element The element which is transitioned
   * @param  {function} callback The callback to be invoked when transition is finished
   * @param  {number} timeout  Timeout in milliseconds. Fallback if transition event is never fired
   */
  Transition.onTransitionEnd = function ($element, callback, timeout) {
    // Fallback on 1 second if transition event is not supported/triggered
    timeout = timeout || 1000;
    Transition.transitionEndEventName = Transition.transitionEndEventName || Transition.getTransitionEndEventName();
    var callbackCalled = false;

    var doCallback = function () {
      if (callbackCalled) {
        return;
      }
      $element.off(Transition.transitionEndEventName, callback);
      callbackCalled = true;
      clearTimeout(timer);
      callback();
    };

    var timer = setTimeout(function () {
      doCallback();
    }, timeout);

    $element.on(Transition.transitionEndEventName, function () {
      doCallback();
    });
  };

  /**
   * Wait for a transition - when finished, invokes next in line
   *
   * @private
   *
   * @param {Object[]}    transitions             Array of transitions
   * @param {H5P.jQuery}  transitions[].$element  Dom element transition is performed on
   * @param {number=}     transitions[].timeout   Timeout fallback if transition end never is triggered
   * @param {bool=}       transitions[].break     If true, sequence breaks after this transition
   * @param {number}      index                   The index for current transition
   */
  var runSequence = function (transitions, index) {
    if (index >= transitions.length) {
      return;
    }

    var transition = transitions[index];
    H5P.Transition.onTransitionEnd(transition.$element, function () {
      if (transition.end) {
        transition.end();
      }
      if (transition.break !== true) {
        runSequence(transitions, index+1);
      }
    }, transition.timeout || undefined);
  };

  /**
   * Run a sequence of transitions
   *
   * @function H5P.Transition.sequence
   * @static
   * @param {Object[]}    transitions             Array of transitions
   * @param {H5P.jQuery}  transitions[].$element  Dom element transition is performed on
   * @param {number=}     transitions[].timeout   Timeout fallback if transition end never is triggered
   * @param {bool=}       transitions[].break     If true, sequence breaks after this transition
   */
  Transition.sequence = function (transitions) {
    runSequence(transitions, 0);
  };

  return Transition;
})(H5P.jQuery);
;var H5P = H5P || {};

/**
 * Class responsible for creating a help text dialog
 */
H5P.JoubelHelpTextDialog = (function ($) {

  var numInstances = 0;
  /**
   * Display a pop-up containing a message.
   *
   * @param {H5P.jQuery}  $container  The container which message dialog will be appended to
   * @param {string}      message     The message
   * @param {string}      closeButtonTitle The title for the close button
   * @return {H5P.jQuery}
   */
  function JoubelHelpTextDialog(header, message, closeButtonTitle) {
    H5P.EventDispatcher.call(this);

    var self = this;

    numInstances++;
    var headerId = 'joubel-help-text-header-' + numInstances;
    var helpTextId = 'joubel-help-text-body-' + numInstances;

    var $helpTextDialogBox = $('<div>', {
      'class': 'joubel-help-text-dialog-box',
      'role': 'dialog',
      'aria-labelledby': headerId,
      'aria-describedby': helpTextId
    });

    $('<div>', {
      'class': 'joubel-help-text-dialog-background'
    }).appendTo($helpTextDialogBox);

    var $helpTextDialogContainer = $('<div>', {
      'class': 'joubel-help-text-dialog-container'
    }).appendTo($helpTextDialogBox);

    $('<div>', {
      'class': 'joubel-help-text-header',
      'id': headerId,
      'role': 'header',
      'html': header
    }).appendTo($helpTextDialogContainer);

    $('<div>', {
      'class': 'joubel-help-text-body',
      'id': helpTextId,
      'html': message,
      'role': 'document',
      'tabindex': 0
    }).appendTo($helpTextDialogContainer);

    var handleClose = function () {
      $helpTextDialogBox.remove();
      self.trigger('closed');
    };

    var $closeButton = $('<div>', {
      'class': 'joubel-help-text-remove',
      'role': 'button',
      'title': closeButtonTitle,
      'tabindex': 1,
      'click': handleClose,
      'keydown': function (event) {
        // 32 - space, 13 - enter
        if ([32, 13].indexOf(event.which) !== -1) {
          event.preventDefault();
          handleClose();
        }
      }
    }).appendTo($helpTextDialogContainer);

    /**
     * Get the DOM element
     * @return {HTMLElement}
     */
    self.getElement = function () {
      return $helpTextDialogBox;
    };

    self.focus = function () {
      $closeButton.focus();
    };
  }

  JoubelHelpTextDialog.prototype = Object.create(H5P.EventDispatcher.prototype);
  JoubelHelpTextDialog.prototype.constructor = JoubelHelpTextDialog;

  return JoubelHelpTextDialog;
}(H5P.jQuery));
;var H5P = H5P || {};

/**
 * Class responsible for creating auto-disappearing dialogs
 */
H5P.JoubelMessageDialog = (function ($) {

  /**
   * Display a pop-up containing a message.
   *
   * @param {H5P.jQuery} $container The container which message dialog will be appended to
   * @param {string} message The message
   * @return {H5P.jQuery}
   */
  function JoubelMessageDialog ($container, message) {
    var timeout;

    var removeDialog = function () {
      $warning.remove();
      clearTimeout(timeout);
      $container.off('click.messageDialog');
    };

    // Create warning popup:
    var $warning = $('<div/>', {
      'class': 'joubel-message-dialog',
      text: message
    }).appendTo($container);

    // Remove after 3 seconds or if user clicks anywhere in $container:
    timeout = setTimeout(removeDialog, 3000);
    $container.on('click.messageDialog', removeDialog);

    return $warning;
  }

  return JoubelMessageDialog;
})(H5P.jQuery);
;var H5P = H5P || {};

/**
 * Class responsible for creating a circular progress bar
 */

H5P.JoubelProgressCircle = (function ($) {

  /**
   * Constructor for the Progress Circle
   *
   * @param {Number} number The amount of progress to display
   * @param {string} progressColor Color for the progress meter
   * @param {string} backgroundColor Color behind the progress meter
   */
  function ProgressCircle(number, progressColor, fillColor, backgroundColor) {
    progressColor = progressColor || '#1a73d9';
    fillColor = fillColor || '#f0f0f0';
    backgroundColor = backgroundColor || '#ffffff';
    var progressColorRGB = this.hexToRgb(progressColor);

    //Verify number
    try {
      number = Number(number);
      if (number === '') {
        throw 'is empty';
      }
      if (isNaN(number)) {
        throw 'is not a number';
      }
    } catch (e) {
      number = 'err';
    }

    //Draw circle
    if (number > 100) {
      number = 100;
    }

    // We can not use rgba, since they will stack on top of each other.
    // Instead we create the equivalent of the rgba color
    // and applies this to the activeborder and background color.
    var progressColorString = 'rgb(' + parseInt(progressColorRGB.r, 10) +
      ',' + parseInt(progressColorRGB.g, 10) +
      ',' + parseInt(progressColorRGB.b, 10) + ')';

    // Circle wrapper
    var $wrapper = $('<div/>', {
      'class': "joubel-progress-circle-wrapper"
    });

    //Active border indicates progress
    var $activeBorder = $('<div/>', {
      'class': "joubel-progress-circle-active-border"
    }).appendTo($wrapper);

    //Background circle
    var $backgroundCircle = $('<div/>', {
      'class': "joubel-progress-circle-circle"
    }).appendTo($activeBorder);

    //Progress text/number
    $('<span/>', {
      'text': number + '%',
      'class': "joubel-progress-circle-percentage"
    }).appendTo($backgroundCircle);

    var deg = number * 3.6;
    if (deg <= 180) {
      $activeBorder.css('background-image',
        'linear-gradient(' + (90 + deg) + 'deg, transparent 50%, ' + fillColor + ' 50%),' +
        'linear-gradient(90deg, ' + fillColor + ' 50%, transparent 50%)')
        .css('border', '2px solid' + backgroundColor)
        .css('background-color', progressColorString);
    } else {
      $activeBorder.css('background-image',
        'linear-gradient(' + (deg - 90) + 'deg, transparent 50%, ' + progressColorString + ' 50%),' +
        'linear-gradient(90deg, ' + fillColor + ' 50%, transparent 50%)')
        .css('border', '2px solid' + backgroundColor)
        .css('background-color', progressColorString);
    }

    this.$activeBorder = $activeBorder;
    this.$backgroundCircle = $backgroundCircle;
    this.$wrapper = $wrapper;

    this.initResizeFunctionality();

    return $wrapper;
  }

  /**
   * Initializes resize functionality for the progress circle
   */
  ProgressCircle.prototype.initResizeFunctionality = function () {
    var self = this;

    $(window).resize(function () {
      // Queue resize
      setTimeout(function () {
        self.resize();
      });
    });

    // First resize
    setTimeout(function () {
      self.resize();
    }, 0);
  };

  /**
   * Resize function makes progress circle grow or shrink relative to parent container
   */
  ProgressCircle.prototype.resize = function () {
    var $parent = this.$wrapper.parent();

    if ($parent !== undefined && $parent) {

      // Measurements
      var fontSize = parseInt($parent.css('font-size'), 10);

      // Static sizes
      var fontSizeMultiplum = 3.75;
      var progressCircleWidthPx = parseInt((fontSize / 4.5), 10) % 2 === 0 ? parseInt((fontSize / 4.5), 10) + 4 : parseInt((fontSize / 4.5), 10) + 5;
      var progressCircleOffset = progressCircleWidthPx / 2;

      var width = fontSize * fontSizeMultiplum;
      var height = fontSize * fontSizeMultiplum;
      this.$activeBorder.css({
        'width': width,
        'height': height
      });

      this.$backgroundCircle.css({
        'width': width - progressCircleWidthPx,
        'height': height - progressCircleWidthPx,
        'top': progressCircleOffset,
        'left': progressCircleOffset
      });
    }
  };

  /**
   * Hex to RGB conversion
   * @param hex
   * @returns {{r: Number, g: Number, b: Number}}
   */
  ProgressCircle.prototype.hexToRgb = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return ProgressCircle;

}(H5P.jQuery));
;var H5P = H5P || {};

H5P.SimpleRoundedButton = (function ($) {

  /**
   * Creates a new tip
   */
  function SimpleRoundedButton(text) {

    var $simpleRoundedButton = $('<div>', {
      'class': 'joubel-simple-rounded-button',
      'title': text,
      'role': 'button',
      'tabindex': '0'
    }).keydown(function (e) {
      // 32 - space, 13 - enter
      if ([32, 13].indexOf(e.which) !== -1) {
        $(this).click();
        e.preventDefault();
      }
    });

    $('<span>', {
      'class': 'joubel-simple-rounded-button-text',
      'html': text
    }).appendTo($simpleRoundedButton);

    return $simpleRoundedButton;
  }

  return SimpleRoundedButton;
}(H5P.jQuery));
;var H5P = H5P || {};

/**
 * Class responsible for creating speech bubbles
 */
H5P.JoubelSpeechBubble = (function ($) {

  var $currentSpeechBubble;
  var $currentContainer;  
  var $tail;
  var $innerTail;
  var removeSpeechBubbleTimeout;
  var currentMaxWidth;

  var DEFAULT_MAX_WIDTH = 400;

  var iDevice = navigator.userAgent.match(/iPod|iPhone|iPad/g) ? true : false;

  /**
   * Creates a new speech bubble
   *
   * @param {H5P.jQuery} $container The speaking object
   * @param {string} text The text to display
   * @param {number} maxWidth The maximum width of the bubble
   * @return {H5P.JoubelSpeechBubble}
   */
  function JoubelSpeechBubble($container, text, maxWidth) {
    maxWidth = maxWidth || DEFAULT_MAX_WIDTH;
    currentMaxWidth = maxWidth;
    $currentContainer = $container;

    this.isCurrent = function ($tip) {
      return $tip.is($currentContainer);
    };

    this.remove = function () {
      remove();
    };

    var fadeOutSpeechBubble = function ($speechBubble) {
      if (!$speechBubble) {
        return;
      }

      // Stop removing bubble
      clearTimeout(removeSpeechBubbleTimeout);

      $speechBubble.removeClass('show');
      setTimeout(function () {
        if ($speechBubble) {
          $speechBubble.remove();
          $speechBubble = undefined;
        }
      }, 500);
    };

    if ($currentSpeechBubble !== undefined) {
      remove();
    }

    var $h5pContainer = getH5PContainer($container);

    // Make sure we fade out old speech bubble
    fadeOutSpeechBubble($currentSpeechBubble);

    // Create bubble
    $tail = $('<div class="joubel-speech-bubble-tail"></div>');
    $innerTail = $('<div class="joubel-speech-bubble-inner-tail"></div>');
    var $innerBubble = $(
      '<div class="joubel-speech-bubble-inner">' +
      '<div class="joubel-speech-bubble-text">' + text + '</div>' +
      '</div>'
    ).prepend($innerTail);

    $currentSpeechBubble = $(
      '<div class="joubel-speech-bubble" aria-live="assertive">'
    ).append([$tail, $innerBubble])
      .appendTo($h5pContainer);

    // Show speech bubble with transition
    setTimeout(function () {
      $currentSpeechBubble.addClass('show');
    }, 0);

    position($currentSpeechBubble, $currentContainer, maxWidth, $tail, $innerTail);

    // Handle click to close
    H5P.$body.on('mousedown.speechBubble', handleOutsideClick);

    // Handle window resizing
    H5P.$window.on('resize', '', handleResize);

    // Handle clicks when inside IV which blocks bubbling.
    $container.parents('.h5p-dialog')
      .on('mousedown.speechBubble', handleOutsideClick);

    if (iDevice) {
      H5P.$body.css('cursor', 'pointer');
    }

    return this;
  }

  // Remove speechbubble if it belongs to a dom element that is about to be hidden
  H5P.externalDispatcher.on('domHidden', function (event) {
    if ($currentSpeechBubble !== undefined && event.data.$dom.find($currentContainer).length !== 0) {
      remove();
    }
  });

  /**
   * Returns the closest h5p container for the given DOM element.
   * 
   * @param {object} $container jquery element
   * @return {object} the h5p container (jquery element)
   */
  function getH5PContainer($container) {
    var $h5pContainer = $container.closest('.h5p-frame');

    // Check closest h5p frame first, then check for container in case there is no frame.
    if (!$h5pContainer.length) {
      $h5pContainer = $container.closest('.h5p-container');
    }

    return $h5pContainer;
  }

  /**
   * Event handler that is called when the window is resized.
   */
  function handleResize() {
    position($currentSpeechBubble, $currentContainer, currentMaxWidth, $tail, $innerTail);
  }

  /**
   * Repositions the speech bubble according to the position of the container.
   * 
   * @param {object} $currentSpeechbubble the speech bubble that should be positioned   
   * @param {object} $container the container to which the speech bubble should point 
   * @param {number} maxWidth the maximum width of the speech bubble
   * @param {object} $tail the tail (the triangle that points to the referenced container)
   * @param {object} $innerTail the inner tail (the triangle that points to the referenced container)
   */
  function position($currentSpeechBubble, $container, maxWidth, $tail, $innerTail) {
    var $h5pContainer = getH5PContainer($container);

    // Calculate offset between the button and the h5p frame
    var offset = getOffsetBetween($h5pContainer, $container);

    var direction = (offset.bottom > offset.top ? 'bottom' : 'top');
    var tipWidth = offset.outerWidth * 0.9; // Var needs to be renamed to make sense
    var bubbleWidth = tipWidth > maxWidth ? maxWidth : tipWidth;

    var bubblePosition = getBubblePosition(bubbleWidth, offset);
    var tailPosition = getTailPosition(bubbleWidth, bubblePosition, offset, $container.width());
    // Need to set font-size, since element is appended to body.
    // Using same font-size as parent. In that way it will grow accordingly
    // when resizing
    var fontSize = 16;//parseFloat($parent.css('font-size'));

    // Set width and position of speech bubble
    $currentSpeechBubble.css(bubbleCSS(
      direction,
      bubbleWidth,
      bubblePosition,
      fontSize
    ));

    var preparedTailCSS = tailCSS(direction, tailPosition);
    $tail.css(preparedTailCSS);
    $innerTail.css(preparedTailCSS);
  }

  /**
   * Static function for removing the speechbubble
   */
  var remove = function () {
    H5P.$body.off('mousedown.speechBubble');
    H5P.$window.off('resize', '', handleResize);
    $currentContainer.parents('.h5p-dialog').off('mousedown.speechBubble');
    if (iDevice) {
      H5P.$body.css('cursor', '');
    }
    if ($currentSpeechBubble !== undefined) {
      // Apply transition, then remove speech bubble
      $currentSpeechBubble.removeClass('show');

      // Make sure we remove any old timeout before reassignment
      clearTimeout(removeSpeechBubbleTimeout);
      removeSpeechBubbleTimeout = setTimeout(function () {
        $currentSpeechBubble.remove();
        $currentSpeechBubble = undefined;
      }, 500);
    }
    // Don't return false here. If the user e.g. clicks a button when the bubble is visible,
    // we want the bubble to disapear AND the button to receive the event
  };

  /**
   * Remove the speech bubble and container reference
   */
  function handleOutsideClick(event) {
    if (event.target === $currentContainer[0]) {
      return; // Button clicks are not outside clicks
    }

    remove();
    // There is no current container when a container isn't clicked
    $currentContainer = undefined;
  }

  /**
   * Calculate position for speech bubble
   *
   * @param {number} bubbleWidth The width of the speech bubble
   * @param {object} offset
   * @return {object} Return position for the speech bubble
   */
  function getBubblePosition(bubbleWidth, offset) {
    var bubblePosition = {};

    var tailOffset = 9;
    var widthOffset = bubbleWidth / 2;

    // Calculate top position
    bubblePosition.top = offset.top + offset.innerHeight;

    // Calculate bottom position
    bubblePosition.bottom = offset.bottom + offset.innerHeight + tailOffset;

    // Calculate left position
    if (offset.left < widthOffset) {
      bubblePosition.left = 3;
    }
    else if ((offset.left + widthOffset) > offset.outerWidth) {
      bubblePosition.left = offset.outerWidth - bubbleWidth - 3;
    }
    else {
      bubblePosition.left = offset.left - widthOffset + (offset.innerWidth / 2);
    }

    return bubblePosition;
  }

  /**
   * Calculate position for speech bubble tail
   *
   * @param {number} bubbleWidth The width of the speech bubble
   * @param {object} bubblePosition Speech bubble position
   * @param {object} offset
   * @param {number} iconWidth The width of the tip icon
   * @return {object} Return position for the tail
   */
  function getTailPosition(bubbleWidth, bubblePosition, offset, iconWidth) {
    var tailPosition = {};
    // Magic numbers. Tuned by hand so that the tail fits visually within
    // the bounds of the speech bubble.
    var leftBoundary = 9;
    var rightBoundary = bubbleWidth - 20;

    tailPosition.left = offset.left - bubblePosition.left + (iconWidth / 2) - 6;
    if (tailPosition.left < leftBoundary) {
      tailPosition.left = leftBoundary;
    }
    if (tailPosition.left > rightBoundary) {
      tailPosition.left = rightBoundary;
    }

    tailPosition.top = -6;
    tailPosition.bottom = -6;

    return tailPosition;
  }

  /**
   * Return bubble CSS for the desired growth direction
   *
   * @param {string} direction The direction the speech bubble will grow
   * @param {number} width The width of the speech bubble
   * @param {object} position Speech bubble position
   * @param {number} fontSize The size of the bubbles font
   * @return {object} Return CSS
   */
  function bubbleCSS(direction, width, position, fontSize) {
    if (direction === 'top') {
      return {
        width: width + 'px',
        bottom: position.bottom + 'px',
        left: position.left + 'px',
        fontSize: fontSize + 'px',
        top: ''
      };
    }
    else {
      return {
        width: width + 'px',
        top: position.top + 'px',
        left: position.left + 'px',
        fontSize: fontSize + 'px',
        bottom: ''
      };
    }
  }

  /**
   * Return tail CSS for the desired growth direction
   *
   * @param {string} direction The direction the speech bubble will grow
   * @param {object} position Tail position
   * @return {object} Return CSS
   */
  function tailCSS(direction, position) {
    if (direction === 'top') {
      return {
        bottom: position.bottom + 'px',
        left: position.left + 'px',
        top: ''
      };
    }
    else {
      return {
        top: position.top + 'px',
        left: position.left + 'px',
        bottom: ''
      };
    }
  }

  /**
   * Calculates the offset between an element inside a container and the
   * container. Only works if all the edges of the inner element are inside the
   * outer element.
   * Width/height of the elements is included as a convenience.
   *
   * @param {H5P.jQuery} $outer
   * @param {H5P.jQuery} $inner
   * @return {object} Position offset
   */
  function getOffsetBetween($outer, $inner) {
    var outer = $outer[0].getBoundingClientRect();
    var inner = $inner[0].getBoundingClientRect();

    return {
      top: inner.top - outer.top,
      right: outer.right - inner.right,
      bottom: outer.bottom - inner.bottom,
      left: inner.left - outer.left,
      innerWidth: inner.width,
      innerHeight: inner.height,
      outerWidth: outer.width,
      outerHeight: outer.height
    };
  }

  return JoubelSpeechBubble;
})(H5P.jQuery);
;var H5P = H5P || {};

H5P.JoubelThrobber = (function ($) {

  /**
   * Creates a new tip
   */
  function JoubelThrobber() {

    // h5p-throbber css is described in core
    var $throbber = $('<div/>', {
      'class': 'h5p-throbber'
    });

    return $throbber;
  }

  return JoubelThrobber;
}(H5P.jQuery));
;H5P.JoubelTip = (function ($) {
  var $conv = $('<div/>');

  /**
   * Creates a new tip element.
   *
   * NOTE that this may look like a class but it doesn't behave like one.
   * It returns a jQuery object.
   *
   * @param {string} tipHtml The text to display in the popup
   * @param {Object} [behaviour] Options
   * @param {string} [behaviour.tipLabel] Set to use a custom label for the tip button (you want this for good A11Y)
   * @param {boolean} [behaviour.helpIcon] Set to 'true' to Add help-icon classname to Tip button (changes the icon)
   * @param {boolean} [behaviour.showSpeechBubble] Set to 'false' to disable functionality (you may this in the editor)
   * @param {boolean} [behaviour.tabcontrol] Set to 'true' if you plan on controlling the tabindex in the parent (tabindex="-1")
   * @return {H5P.jQuery|undefined} Tip button jQuery element or 'undefined' if invalid tip
   */
  function JoubelTip(tipHtml, behaviour) {

    // Keep track of the popup that appears when you click the Tip button
    var speechBubble;

    // Parse tip html to determine text
    var tipText = $conv.html(tipHtml).text().trim();
    if (tipText === '') {
      return; // The tip has no textual content, i.e. it's invalid.
    }

    // Set default behaviour
    behaviour = $.extend({
      tipLabel: tipText,
      helpIcon: false,
      showSpeechBubble: true,
      tabcontrol: false
    }, behaviour);

    // Create Tip button
    var $tipButton = $('<div/>', {
      class: 'joubel-tip-container' + (behaviour.showSpeechBubble ? '' : ' be-quiet'),
      'aria-label': behaviour.tipLabel,
      'aria-expanded': false,
      role: 'button',
      tabindex: (behaviour.tabcontrol ? -1 : 0),
      click: function (event) {
        // Toggle show/hide popup
        toggleSpeechBubble();
        event.preventDefault();
      },
      keydown: function (event) {
        if (event.which === 32 || event.which === 13) { // Space & enter key
          // Toggle show/hide popup
          toggleSpeechBubble();
          event.stopPropagation();
          event.preventDefault();
        }
        else { // Any other key
          // Toggle hide popup
          toggleSpeechBubble(false);
        }
      },
      // Add markup to render icon
      html: '<span class="joubel-icon-tip-normal ' + (behaviour.helpIcon ? ' help-icon': '') + '">' +
              '<span class="h5p-icon-shadow"></span>' +
              '<span class="h5p-icon-speech-bubble"></span>' +
              '<span class="h5p-icon-info"></span>' +
            '</span>'
      // IMPORTANT: All of the markup elements must have 'pointer-events: none;'
    });

    const $tipAnnouncer = $('<div>', {
      'class': 'hidden-but-read',
      'aria-live': 'polite',
      appendTo: $tipButton,
    });

    /**
     * Tip button interaction handler.
     * Toggle show or hide the speech bubble popup when interacting with the
     * Tip button.
     *
     * @private
     * @param {boolean} [force] 'true' shows and 'false' hides.
     */
    var toggleSpeechBubble = function (force) {
      if (speechBubble !== undefined && speechBubble.isCurrent($tipButton)) {
        // Hide current popup
        speechBubble.remove();
        speechBubble = undefined;

        $tipButton.attr('aria-expanded', false);
        $tipAnnouncer.html('');
      }
      else if (force !== false && behaviour.showSpeechBubble) {
        // Create and show new popup
        speechBubble = H5P.JoubelSpeechBubble($tipButton, tipHtml);
        $tipButton.attr('aria-expanded', true);
        $tipAnnouncer.html(tipHtml);
      }
    };

    return $tipButton;
  }

  return JoubelTip;
})(H5P.jQuery);
;var H5P = H5P || {};

H5P.JoubelSlider = (function ($) {

  /**
   * Creates a new Slider
   *
   * @param {object} [params] Additional parameters
   */
  function JoubelSlider(params) {
    H5P.EventDispatcher.call(this);

    this.$slider = $('<div>', $.extend({
      'class': 'h5p-joubel-ui-slider'
    }, params));

    this.$slides = [];
    this.currentIndex = 0;
    this.numSlides = 0;
  }
  JoubelSlider.prototype = Object.create(H5P.EventDispatcher.prototype);
  JoubelSlider.prototype.constructor = JoubelSlider;

  JoubelSlider.prototype.addSlide = function ($content) {
    $content.addClass('h5p-joubel-ui-slide').css({
      'left': (this.numSlides*100) + '%'
    });
    this.$slider.append($content);
    this.$slides.push($content);

    this.numSlides++;

    if(this.numSlides === 1) {
      $content.addClass('current');
    }
  };

  JoubelSlider.prototype.attach = function ($container) {
    $container.append(this.$slider);
  };

  JoubelSlider.prototype.move = function (index) {
    var self = this;

    if(index === 0) {
      self.trigger('first-slide');
    }
    if(index+1 === self.numSlides) {
      self.trigger('last-slide');
    }
    self.trigger('move');

    var $previousSlide = self.$slides[this.currentIndex];
    H5P.Transition.onTransitionEnd(this.$slider, function () {
      $previousSlide.removeClass('current');
      self.trigger('moved');
    });
    this.$slides[index].addClass('current');

    var translateX = 'translateX(' + (-index*100) + '%)';
    this.$slider.css({
      '-webkit-transform': translateX,
      '-moz-transform': translateX,
      '-ms-transform': translateX,
      'transform': translateX
    });

    this.currentIndex = index;
  };

  JoubelSlider.prototype.remove = function () {
    this.$slider.remove();
  };

  JoubelSlider.prototype.next = function () {
    if(this.currentIndex+1 >= this.numSlides) {
      return;
    }

    this.move(this.currentIndex+1);
  };

  JoubelSlider.prototype.previous = function () {
    this.move(this.currentIndex-1);
  };

  JoubelSlider.prototype.first = function () {
    this.move(0);
  };

  JoubelSlider.prototype.last = function () {
    this.move(this.numSlides-1);
  };

  return JoubelSlider;
})(H5P.jQuery);
;var H5P = H5P || {};

/**
 * @module
 */
H5P.JoubelScoreBar = (function ($) {

  /* Need to use an id for the star SVG since that is the only way to reference
     SVG filters  */
  var idCounter = 0;

  /**
   * Creates a score bar
   * @class H5P.JoubelScoreBar
   * @param {number} maxScore  Maximum score
   * @param {string} [label] Makes it easier for readspeakers to identify the scorebar
   * @param {string} [helpText] Score explanation
   * @param {string} [scoreExplanationButtonLabel] Label for score explanation button
   */
  function JoubelScoreBar(maxScore, label, helpText, scoreExplanationButtonLabel) {
    var self = this;

    self.maxScore = maxScore;
    self.score = 0;
    idCounter++;

    /**
     * @const {string}
     */
    self.STAR_MARKUP = '<svg tabindex="-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.77 53.87" aria-hidden="true" focusable="false">' +
        '<title>star</title>' +
        '<filter tabindex="-1" id="h5p-joubelui-score-bar-star-inner-shadow-' + idCounter + '" x0="-50%" y0="-50%" width="200%" height="200%">' +
          '<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"></feGaussianBlur>' +
          '<feOffset dy="2" dx="4"></feOffset>' +
          '<feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"></feComposite>' +
          '<feFlood flood-color="#ffe95c" flood-opacity="1"></feFlood>' +
          '<feComposite in2="shadowDiff" operator="in"></feComposite>' +
          '<feComposite in2="SourceGraphic" operator="over" result="firstfilter"></feComposite>' +
          '<feGaussianBlur in="firstfilter" stdDeviation="3" result="blur2"></feGaussianBlur>' +
          '<feOffset dy="-2" dx="-4"></feOffset>' +
          '<feComposite in2="firstfilter" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"></feComposite>' +
          '<feFlood flood-color="#ffe95c" flood-opacity="1"></feFlood>' +
          '<feComposite in2="shadowDiff" operator="in"></feComposite>' +
          '<feComposite in2="firstfilter" operator="over"></feComposite>' +
        '</filter>' +
        '<path tabindex="-1" class="h5p-joubelui-score-bar-star-shadow" d="M35.08,43.41V9.16H20.91v0L9.51,10.85,9,10.93C2.8,12.18,0,17,0,21.25a11.22,11.22,0,0,0,3,7.48l8.73,8.53-1.07,6.16Z"/>' +
        '<g tabindex="-1">' +
          '<path tabindex="-1" class="h5p-joubelui-score-bar-star-border" d="M61.36,22.8,49.72,34.11l2.78,16a2.6,2.6,0,0,1,.05.64c0,.85-.37,1.6-1.33,1.6A2.74,2.74,0,0,1,49.94,52L35.58,44.41,21.22,52a2.93,2.93,0,0,1-1.28.37c-.91,0-1.33-.75-1.33-1.6,0-.21.05-.43.05-.64l2.78-16L9.8,22.8A2.57,2.57,0,0,1,9,21.25c0-1,1-1.33,1.81-1.49l16.07-2.35L34.09,2.83c.27-.59.85-1.33,1.55-1.33s1.28.69,1.55,1.33l7.21,14.57,16.07,2.35c.75.11,1.81.53,1.81,1.49A3.07,3.07,0,0,1,61.36,22.8Z"/>' +
          '<path tabindex="-1" class="h5p-joubelui-score-bar-star-fill" d="M61.36,22.8,49.72,34.11l2.78,16a2.6,2.6,0,0,1,.05.64c0,.85-.37,1.6-1.33,1.6A2.74,2.74,0,0,1,49.94,52L35.58,44.41,21.22,52a2.93,2.93,0,0,1-1.28.37c-.91,0-1.33-.75-1.33-1.6,0-.21.05-.43.05-.64l2.78-16L9.8,22.8A2.57,2.57,0,0,1,9,21.25c0-1,1-1.33,1.81-1.49l16.07-2.35L34.09,2.83c.27-.59.85-1.33,1.55-1.33s1.28.69,1.55,1.33l7.21,14.57,16.07,2.35c.75.11,1.81.53,1.81,1.49A3.07,3.07,0,0,1,61.36,22.8Z"/>' +
          '<path tabindex="-1" filter="url(#h5p-joubelui-score-bar-star-inner-shadow-' + idCounter + ')" class="h5p-joubelui-score-bar-star-fill-full-score" d="M61.36,22.8,49.72,34.11l2.78,16a2.6,2.6,0,0,1,.05.64c0,.85-.37,1.6-1.33,1.6A2.74,2.74,0,0,1,49.94,52L35.58,44.41,21.22,52a2.93,2.93,0,0,1-1.28.37c-.91,0-1.33-.75-1.33-1.6,0-.21.05-.43.05-.64l2.78-16L9.8,22.8A2.57,2.57,0,0,1,9,21.25c0-1,1-1.33,1.81-1.49l16.07-2.35L34.09,2.83c.27-.59.85-1.33,1.55-1.33s1.28.69,1.55,1.33l7.21,14.57,16.07,2.35c.75.11,1.81.53,1.81,1.49A3.07,3.07,0,0,1,61.36,22.8Z"/>' +
        '</g>' +
      '</svg>';

    /**
     * @function appendTo
     * @memberOf H5P.JoubelScoreBar#
     * @param {H5P.jQuery}  $wrapper  Dom container
     */
    self.appendTo = function ($wrapper) {
      self.$scoreBar.appendTo($wrapper);
    };

    /**
     * Create the text representation of the scorebar .
     *
     * @private
     * @return {string}
     */
    var createLabel = function (score) {
      if (!label) {
        return '';
      }

      return label.replace(':num', score).replace(':total', self.maxScore);
    };

    /**
     * Creates the html for this widget
     *
     * @method createHtml
     * @private
     */
    var createHtml = function () {
      // Container div
      self.$scoreBar = $('<div>', {
        'class': 'h5p-joubelui-score-bar',
      });

      var $visuals = $('<div>', {
        'class': 'h5p-joubelui-score-bar-visuals',
        appendTo: self.$scoreBar
      });

      // The progress bar wrapper
      self.$progressWrapper = $('<div>', {
        'class': 'h5p-joubelui-score-bar-progress-wrapper',
        appendTo: $visuals
      });

      self.$progress = $('<div>', {
        'class': 'h5p-joubelui-score-bar-progress',
        'html': createLabel(self.score),
        appendTo: self.$progressWrapper
      });

      // The star
      $('<div>', {
        'class': 'h5p-joubelui-score-bar-star',
        html: self.STAR_MARKUP
      }).appendTo($visuals);

      // The score container
      var $numerics = $('<div>', {
        'class': 'h5p-joubelui-score-numeric',
        appendTo: self.$scoreBar,
        'aria-hidden': true
      });

      // The current score
      self.$scoreCounter = $('<span>', {
        'class': 'h5p-joubelui-score-number h5p-joubelui-score-number-counter',
        text: 0,
        appendTo: $numerics
      });

      // The separator
      $('<span>', {
        'class': 'h5p-joubelui-score-number-separator',
        text: '/',
        appendTo: $numerics
      });

      // Max score
      self.$maxScore = $('<span>', {
        'class': 'h5p-joubelui-score-number h5p-joubelui-score-max',
        text: self.maxScore,
        appendTo: $numerics
      });

      if (helpText) {
        H5P.JoubelUI.createTip(helpText, {
          tipLabel: scoreExplanationButtonLabel ? scoreExplanationButtonLabel : helpText,
          helpIcon: true
        }).appendTo(self.$scoreBar);
        self.$scoreBar.addClass('h5p-score-bar-has-help');
      }
    };

    /**
     * Set the current score
     * @method setScore
     * @memberOf H5P.JoubelScoreBar#
     * @param  {number} score
     */
    self.setScore = function (score) {
      // Do nothing if score hasn't changed
      if (score === self.score) {
        return;
      }
      self.score = score > self.maxScore ? self.maxScore : score;
      self.updateVisuals();
    };

    /**
     * Increment score
     * @method incrementScore
     * @memberOf H5P.JoubelScoreBar#
     * @param  {number=}        incrementBy Optional parameter, defaults to 1
     */
    self.incrementScore = function (incrementBy) {
      self.setScore(self.score + (incrementBy || 1));
    };

    /**
     * Set the max score
     * @method setMaxScore
     * @memberOf H5P.JoubelScoreBar#
     * @param  {number}    maxScore The max score
     */
    self.setMaxScore = function (maxScore) {
      self.maxScore = maxScore;
    };

    /**
     * Updates the progressbar visuals
     * @memberOf H5P.JoubelScoreBar#
     * @method updateVisuals
     */
    self.updateVisuals = function () {
      self.$progress.html(createLabel(self.score));
      self.$scoreCounter.text(self.score);
      self.$maxScore.text(self.maxScore);

      setTimeout(function () {
        // Start the progressbar animation
        self.$progress.css({
          width: ((self.score / self.maxScore) * 100) + '%'
        });

        H5P.Transition.onTransitionEnd(self.$progress, function () {
          // If fullscore fill the star and start the animation
          self.$scoreBar.toggleClass('h5p-joubelui-score-bar-full-score', self.score === self.maxScore);
          self.$scoreBar.toggleClass('h5p-joubelui-score-bar-animation-active', self.score === self.maxScore);

          // Only allow the star animation to run once
          self.$scoreBar.one("animationend", function() {
            self.$scoreBar.removeClass("h5p-joubelui-score-bar-animation-active");
          });
        }, 600);
      }, 300);
    };

    /**
     * Removes all classes
     * @method reset
     */
    self.reset = function () {
      self.$scoreBar.removeClass('h5p-joubelui-score-bar-full-score');
    };

    createHtml();
  }

  return JoubelScoreBar;
})(H5P.jQuery);
;var H5P = H5P || {};

H5P.JoubelProgressbar = (function ($) {

  /**
   * Joubel progressbar class
   * @method JoubelProgressbar
   * @constructor
   * @param  {number}          steps Number of steps
   * @param {Object} [options] Additional options
   * @param {boolean} [options.disableAria] Disable readspeaker assistance
   * @param {string} [options.progressText] A progress text for describing
   *  current progress out of total progress for readspeakers.
   *  e.g. "Slide :num of :total"
   */
  function JoubelProgressbar(steps, options) {
    H5P.EventDispatcher.call(this);
    var self = this;
    this.options = $.extend({
      progressText: 'Slide :num of :total'
    }, options);
    this.currentStep = 0;
    this.steps = steps;

    this.$progressbar = $('<div>', {
      'class': 'h5p-joubelui-progressbar'
    });
    this.$background = $('<div>', {
      'class': 'h5p-joubelui-progressbar-background'
    }).appendTo(this.$progressbar);
  }

  JoubelProgressbar.prototype = Object.create(H5P.EventDispatcher.prototype);
  JoubelProgressbar.prototype.constructor = JoubelProgressbar;

  JoubelProgressbar.prototype.updateAria = function () {
    var self = this;
    if (this.options.disableAria) {
      return;
    }

    if (!this.$currentStatus) {
      this.$currentStatus = $('<div>', {
        'class': 'h5p-joubelui-progressbar-slide-status-text',
        'aria-live': 'assertive'
      }).appendTo(this.$progressbar);
    }
    var interpolatedProgressText = self.options.progressText
      .replace(':num', self.currentStep)
      .replace(':total', self.steps);
    this.$currentStatus.html(interpolatedProgressText);
  };

  /**
   * Appends to a container
   * @method appendTo
   * @param  {H5P.jquery} $container
   */
  JoubelProgressbar.prototype.appendTo = function ($container) {
    this.$progressbar.appendTo($container);
  };

  /**
   * Update progress
   * @method setProgress
   * @param  {number}    step
   */
  JoubelProgressbar.prototype.setProgress = function (step) {
    // Check for valid value:
    if (step > this.steps || step < 0) {
      return;
    }
    this.currentStep = step;
    this.$background.css({
      width: ((this.currentStep/this.steps)*100) + '%'
    });

    this.updateAria();
  };

  /**
   * Increment progress with 1
   * @method next
   */
  JoubelProgressbar.prototype.next = function () {
    this.setProgress(this.currentStep+1);
  };

  /**
   * Reset progressbar
   * @method reset
   */
  JoubelProgressbar.prototype.reset = function () {
    this.setProgress(0);
  };

  /**
   * Check if last step is reached
   * @method isLastStep
   * @return {Boolean}
   */
  JoubelProgressbar.prototype.isLastStep = function () {
    return this.steps === this.currentStep;
  };

  return JoubelProgressbar;
})(H5P.jQuery);
;var H5P = H5P || {};

/**
 * H5P Joubel UI library.
 *
 * This is a utility library, which does not implement attach. I.e, it has to bee actively used by
 * other libraries
 * @module
 */
H5P.JoubelUI = (function ($) {

  /**
   * The internal object to return
   * @class H5P.JoubelUI
   * @static
   */
  function JoubelUI() {}

  /* Public static functions */

  /**
   * Create a tip icon
   * @method H5P.JoubelUI.createTip
   * @param  {string}  text   The textual tip
   * @param  {Object}  params Parameters
   * @return {H5P.JoubelTip}
   */
  JoubelUI.createTip = function (text, params) {
    return new H5P.JoubelTip(text, params);
  };

  /**
   * Create message dialog
   * @method H5P.JoubelUI.createMessageDialog
   * @param  {H5P.jQuery}               $container The dom container
   * @param  {string}                   message    The message
   * @return {H5P.JoubelMessageDialog}
   */
  JoubelUI.createMessageDialog = function ($container, message) {
    return new H5P.JoubelMessageDialog($container, message);
  };

  /**
   * Create help text dialog
   * @method H5P.JoubelUI.createHelpTextDialog
   * @param  {string}             header  The textual header
   * @param  {string}             message The textual message
   * @param  {string}             closeButtonTitle The title for the close button
   * @return {H5P.JoubelHelpTextDialog}
   */
  JoubelUI.createHelpTextDialog = function (header, message, closeButtonTitle) {
    return new H5P.JoubelHelpTextDialog(header, message, closeButtonTitle);
  };

  /**
   * Create progress circle
   * @method H5P.JoubelUI.createProgressCircle
   * @param  {number}             number          The progress (0 to 100)
   * @param  {string}             progressColor   The progress color in hex value
   * @param  {string}             fillColor       The fill color in hex value
   * @param  {string}             backgroundColor The background color in hex value
   * @return {H5P.JoubelProgressCircle}
   */
  JoubelUI.createProgressCircle = function (number, progressColor, fillColor, backgroundColor) {
    return new H5P.JoubelProgressCircle(number, progressColor, fillColor, backgroundColor);
  };

  /**
   * Create throbber for loading
   * @method H5P.JoubelUI.createThrobber
   * @return {H5P.JoubelThrobber}
   */
  JoubelUI.createThrobber = function () {
    return new H5P.JoubelThrobber();
  };

  /**
   * Create simple rounded button
   * @method H5P.JoubelUI.createSimpleRoundedButton
   * @param  {string}                  text The button label
   * @return {H5P.SimpleRoundedButton}
   */
  JoubelUI.createSimpleRoundedButton = function (text) {
    return new H5P.SimpleRoundedButton(text);
  };

  /**
   * Create Slider
   * @method H5P.JoubelUI.createSlider
   * @param  {Object} [params] Parameters
   * @return {H5P.JoubelSlider}
   */
  JoubelUI.createSlider = function (params) {
    return new H5P.JoubelSlider(params);
  };

  /**
   * Create Score Bar
   * @method H5P.JoubelUI.createScoreBar
   * @param  {number=}       maxScore The maximum score
   * @param {string} [label] Makes it easier for readspeakers to identify the scorebar
   * @return {H5P.JoubelScoreBar}
   */
  JoubelUI.createScoreBar = function (maxScore, label, helpText, scoreExplanationButtonLabel) {
    return new H5P.JoubelScoreBar(maxScore, label, helpText, scoreExplanationButtonLabel);
  };

  /**
   * Create Progressbar
   * @method H5P.JoubelUI.createProgressbar
   * @param  {number=}       numSteps The total numer of steps
   * @param {Object} [options] Additional options
   * @param {boolean} [options.disableAria] Disable readspeaker assistance
   * @param {string} [options.progressText] A progress text for describing
   *  current progress out of total progress for readspeakers.
   *  e.g. "Slide :num of :total"
   * @return {H5P.JoubelProgressbar}
   */
  JoubelUI.createProgressbar = function (numSteps, options) {
    return new H5P.JoubelProgressbar(numSteps, options);
  };

  /**
   * Create standard Joubel button
   *
   * @method H5P.JoubelUI.createButton
   * @param {object} params
   *  May hold any properties allowed by jQuery. If href is set, an A tag
   *  is used, if not a button tag is used.
   * @return {H5P.jQuery} The jquery element created
   */
  JoubelUI.createButton = function(params) {
    var type = 'button';
    if (params.href) {
      type = 'a';
    }
    else {
      params.type = 'button';
    }
    if (params.class) {
      params.class += ' h5p-joubelui-button';
    }
    else {
      params.class = 'h5p-joubelui-button';
    }
    return $('<' + type + '/>', params);
  };

  /**
   * Fix for iframe scoll bug in IOS. When focusing an element that doesn't have
   * focus support by default the iframe will scroll the parent frame so that
   * the focused element is out of view. This varies dependening on the elements
   * of the parent frame.
   */
  if (H5P.isFramed && !H5P.hasiOSiframeScrollFix &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    H5P.hasiOSiframeScrollFix = true;

    // Keep track of original focus function
    var focus = HTMLElement.prototype.focus;

    // Override the original focus
    HTMLElement.prototype.focus = function () {
      // Only focus the element if it supports it natively
      if ( (this instanceof HTMLAnchorElement ||
            this instanceof HTMLInputElement ||
            this instanceof HTMLSelectElement ||
            this instanceof HTMLTextAreaElement ||
            this instanceof HTMLButtonElement ||
            this instanceof HTMLIFrameElement ||
            this instanceof HTMLAreaElement) && // HTMLAreaElement isn't supported by Safari yet.
          !this.getAttribute('role')) { // Focus breaks if a different role has been set
          // In theory this.isContentEditable should be able to recieve focus,
          // but it didn't work when tested.

        // Trigger the original focus with the proper context
        focus.call(this);
      }
    };
  }

  return JoubelUI;
})(H5P.jQuery);
;(()=>{var e={454:e=>{e.exports=function(e,t){this.index=e,this.parent=t}},270:(e,t,i)=>{const n=i(454),r=H5P.EventDispatcher;function s(e,t){const i=this;r.call(i),i.children=[];var s=function(e){for(let t=e;t<i.children.length;t++)i.children[t].index=t};if(i.addChild=function(t,r){void 0===r&&(r=i.children.length);const o=new n(r,i);return r===i.children.length?i.children.push(o):(i.children.splice(r,0,o),s(r)),e.call(o,t),o},i.removeChild=function(e){i.children.splice(e,1),s(e)},i.moveChild=function(e,t){const n=i.children.splice(e,1)[0];i.children.splice(t,0,n),s(t<e?t:e)},t)for(let e=0;e<t.length;e++)i.addChild(t[e])}s.prototype=Object.create(r.prototype),s.prototype.constructor=s,e.exports=s}},t={};function i(n){var r=t[n];if(void 0!==r)return r.exports;var s=t[n]={exports:{}};return e[n](s,s.exports,i),s.exports}i.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return i.d(t,{a:t}),t},i.d=(e,t)=>{for(var n in t)i.o(t,n)&&!i.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=i(270),t=i.n(e),n=H5P.jQuery,r=H5P.EventDispatcher,s=H5P.JoubelUI,o=function(e){return e.concat.apply([],e)},a=function(e){return"function"==typeof e},l=null!==navigator.userAgent.match(/iPad/i),c=null!==navigator.userAgent.match(/iPad|iPod|iPhone/i),d=function(e,t){return-1!==e.indexOf(t)},p=function(e,t){return void 0!==e?e:t},h=13,u=27,f=32,m=function(e,t,i){e.click((function(e){t.call(i||this,e)})),e.keydown((function(e){d([h,f],e.which)&&(e.preventDefault(),t.call(i||this,e))}))},v=n("<div>");const g=function(){function e(e,t){this.$summarySlide=t,this.cp=e}return e.prototype.updateSummarySlide=function(e,t){var i=this,r=void 0===this.cp.editor&&void 0!==this.$summarySlide&&e>=this.cp.slides.length-1,o=!this.cp.showSummarySlide&&this.cp.hasAnswerElements;if(r){i.cp.presentation.keywordListEnabled&&i.cp.presentation.keywordListAlwaysShow&&i.cp.hideKeywords(),this.$summarySlide.children().remove();var a=i.cp.getSlideScores(t),l=i.outputScoreStats(a);if(n(l).appendTo(i.$summarySlide),!o){var c=i.totalScores(a);if(!isNaN(c.totalPercentage)){var d=s.createScoreBar(c.totalMaxScore,"","","");d.setScore(c.totalScore);var p=n(".h5p-summary-total-score",i.$summarySlide);d.appendTo(p),setTimeout((function(){p.append(n("<div/>",{"aria-live":"polite",class:"hidden-but-read",html:i.cp.l10n.summary+". "+i.cp.l10n.accessibilityTotalScore.replace("@score",c.totalScore).replace("@maxScore",c.totalMaxScore)}))}),100)}if(!0===i.cp.enableTwitterShare){var h=n(".h5p-summary-twitter-message",i.$summarySlide);this.addTwitterScoreLinkTo(h,c)}if(!0===i.cp.enableFacebookShare){var u=n(".h5p-summary-facebook-message",i.$summarySlide);this.addFacebookScoreLinkTo(u,c)}if(!0===i.cp.enableGoogleShare){var f=n(".h5p-summary-google-message",i.$summarySlide);this.addGoogleScoreLinkTo(f)}i.$summarySlide.find(".h5p-td > .h5p-slide-link").each((function(){var e=n(this);e.click((function(t){i.cp.jumpToSlide(parseInt(e.data("slide"),10)-1),t.preventDefault()}))}))}var m=n(".h5p-summary-footer",i.$summarySlide);this.cp.showSummarySlideSolutionButton&&s.createButton({class:"h5p-show-solutions",html:i.cp.l10n.showSolutions,on:{click:function(){i.toggleSolutionMode(!0)}},appendTo:m}),this.cp.showSummarySlideRetryButton&&s.createButton({class:"h5p-cp-retry-button",html:i.cp.l10n.retry,on:{click:function(){i.cp.resetTask()}},appendTo:m}),i.cp.hasAnswerElements&&s.createButton({class:"h5p-eta-export",html:i.cp.l10n.exportAnswers,on:{click:function(){H5P.ExportableTextArea.Exporter.run(i.cp.slides,i.cp.elementInstances)}},appendTo:m})}},e.prototype.outputScoreStats=function(e){if(void 0===e)return this.$summarySlide.addClass("h5p-summary-only-export"),'<div class="h5p-summary-footer"></div>';var t,i=this,n=0,r=0,s="",o=0,a="";for(t=0;t<e.length;t+=1)a=this.getSlideDescription(e[t]),o=Math.round(e[t].score/e[t].maxScore*100),isNaN(o)&&(o=0),s+='<tr><td class="h5p-td h5p-summary-task-title"><a href="#" class="h5p-slide-link"  aria-label=" '+i.cp.l10n.slide+" "+e[t].slide+": "+a.replace(/(<([^>]+)>)/gi,"")+" "+o+'%" data-slide="'+e[t].slide+'">'+i.cp.l10n.slide+" "+e[t].slide+": "+a.replace(/(<([^>]+)>)/gi,"")+'</a></td><td class="h5p-td h5p-summary-score-bar"><p class="hidden-but-read">'+o+"%</p><p>"+e[t].score+"<span>/</span>"+e[t].maxScore+"</p></td></tr>",n+=e[t].score,r+=e[t].maxScore;this.cp.isSolutionMode||this.cp.ignoreResize||i.cp.triggerXAPICompleted(n,r);var l=i.cp.enableTwitterShare||i.cp.enableFacebookShare||i.cp.enableGoogleShare?'<span class="h5p-show-results-text">'+i.cp.l10n.shareResult+"</span>":"",c=!0===i.cp.enableTwitterShare?'<span class="h5p-summary-twitter-message" aria-label="'+i.cp.l10n.shareTwitter+'"></span>':"",d=!0===i.cp.enableFacebookShare?'<span class="h5p-summary-facebook-message" aria-label="'+i.cp.l10n.shareFacebook+'"></span>':"",p=!0===i.cp.enableGoogleShare?'<span class="h5p-summary-google-message" aria-label="'+i.cp.l10n.shareGoogle+'"></span>':"";return'<div class="h5p-summary-table-holder"><div class="h5p-summary-table-pages"><table class="h5p-score-table"><thead><tr><th class="h5p-summary-table-header slide">'+i.cp.l10n.slide+'</th><th class="h5p-summary-table-header score">'+i.cp.l10n.score+"<span>/</span>"+i.cp.l10n.total.toLowerCase()+"</th></tr></thead><tbody>"+s+'</tbody></table></div><div class="h5p-summary-total-table"><div class="h5p-summary-social">'+l+d+c+p+'</div><div class="h5p-summary-total-score"><p>'+i.cp.l10n.totalScore+'</p></div></div></div><div class="h5p-summary-footer"></div>'},e.prototype.getSlideDescription=function(e){var t,i,n=this,r=n.cp.slides[e.slide-1].elements;if(e.indexes.length>1)t=n.cp.l10n.summaryMultipleTaskText;else if(void 0!==r[e.indexes[0]]&&r[0])if(i=r[e.indexes[0]].action,"function"==typeof n.cp.elementInstances[e.slide-1][e.indexes[0]].getTitle)t=n.cp.elementInstances[e.slide-1][e.indexes[0]].getTitle();else if(void 0!==i.library&&i.library){var s=i.library.split(" ")[0].split(".")[1].split(/(?=[A-Z])/),o="";s.forEach((function(e,t){0!==t&&(e=e.toLowerCase()),o+=e,t<=s.length-1&&(o+=" ")})),t=o}return t},e.prototype.addTwitterScoreLinkTo=function(e,t){var i=this,n=i.cp.twitterShareStatement||"",r=i.cp.twitterShareHashtags||"",s=i.cp.twitterShareUrl||"";s=s.replace("@currentpageurl",window.location.href),n=n.replace("@score",t.totalScore).replace("@maxScore",t.totalMaxScore).replace("@percentage",t.totalPercentage+"%").replace("@currentpageurl",window.location.href),r=r.trim().replace(" ",""),n=encodeURIComponent(n),r=encodeURIComponent(r),s=encodeURIComponent(s);var o="https://twitter.com/intent/tweet?";o+=n.length>0?"text="+n+"&":"",o+=s.length>0?"url="+s+"&":"",o+=r.length>0?"hashtags="+r:"";var a=window.innerWidth/2,l=window.innerHeight/2;e.attr("tabindex","0").attr("role","button"),m(e,(function(){return window.open(o,i.cp.l10n.shareTwitter,"width=800,height=300,left="+a+",top="+l),!1}))},e.prototype.addFacebookScoreLinkTo=function(e,t){var i=this,n=i.cp.facebookShareUrl||"",r=i.cp.facebookShareQuote||"";n=n.replace("@currentpageurl",window.location.href),r=r.replace("@currentpageurl",window.location.href).replace("@percentage",t.totalPercentage+"%").replace("@score",t.totalScore).replace("@maxScore",t.totalMaxScore),n=encodeURIComponent(n),r=encodeURIComponent(r);var s="https://www.facebook.com/sharer/sharer.php?";s+=n.length>0?"u="+n+"&":"",s+=r.length>0?"quote="+r:"";var o=window.innerWidth/2,a=window.innerHeight/2;e.attr("tabindex","0").attr("role","button"),m(e,(function(){return window.open(s,i.cp.l10n.shareFacebook,"width=800,height=300,left="+o+",top="+a),!1}))},e.prototype.addGoogleScoreLinkTo=function(e){var t=this,i=t.cp.googleShareUrl||"";i=i.replace("@currentpageurl",window.location.href),i=encodeURIComponent(i);var n="https://plus.google.com/share?";n+=i.length>0?"url="+i:"";var r=window.innerWidth/2,s=window.innerHeight/2;e.attr("tabindex","0").attr("role","button"),m(e,(function(){return window.open(n,t.cp.l10n.shareGoogle,"width=401,height=437,left="+r+",top="+s),!1}))},e.prototype.totalScores=function(e){if(void 0===e)return{totalScore:0,totalMaxScore:0,totalPercentage:0};var t,i=0,n=0;for(t=0;t<e.length;t+=1)i+=e[t].score,n+=e[t].maxScore;var r=Math.round(i/n*100);return isNaN(r)&&(r=0),{totalScore:i,totalMaxScore:n,totalPercentage:r}},e.prototype.toggleSolutionMode=function(e){if(this.cp.isSolutionMode=e,e){var t=this.cp.showSolutions();this.cp.setProgressBarFeedback(t),this.cp.$footer.addClass("h5p-footer-solution-mode"),this.setFooterSolutionModeText(this.cp.l10n.solutionModeText)}else this.cp.$footer.removeClass("h5p-footer-solution-mode"),this.setFooterSolutionModeText(),this.cp.setProgressBarFeedback()},e.prototype.setFooterSolutionModeText=function(e){void 0!==e&&e?this.cp.$exitSolutionModeText.html(e):this.cp.$exitSolutionModeText&&this.cp.$exitSolutionModeText.html("")},e}();var b=function(e){var t=0;function i(){}return i.supported=function(){return"function"==typeof window.print},i.print=function(t,i,n){t.trigger("printing",{finished:!1,allSlides:n});var r=e(".h5p-slide.h5p-current"),s=r.height(),o=r.width()/670,a=e(".h5p-slide");a.css({height:s/o+"px",width:"670px",fontSize:Math.floor(100/o)+"%"}),e(".h5p-summary-slide").css("height","");var l=e(".h5p-joubelui-score-bar-star").css("display");e(".h5p-joubelui-score-bar-star").css("display","none");var c=i.height();i.css("height","auto"),a.toggleClass("doprint",!0===n),r.addClass("doprint");var d=function(){a.css({height:"",width:"",fontSize:""}),i.css("height",c+"px"),e(".h5p-joubelui-score-bar-star").css("display",l),t.trigger("printing",{finished:!0})};setTimeout((function(){window.focus(),window.print(),/iPad|iPhone|Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent)?setTimeout((function(){d()}),1500):d()}),500)},i.showDialog=function(i,n,r){var s=this,o=t++,a="h5p-cp-print-dialog-".concat(o,"-title"),l="h5p-cp-print-dialog-".concat(o,"-ingress"),c=e('<div class="h5p-popup-dialog h5p-print-dialog">\n                      <div role="dialog" aria-labelledby="'.concat(a,'" aria-describedby="').concat(l,'" tabindex="-1" class="h5p-inner">\n                        <h2 id="').concat(a,'">').concat(i.printTitle,'</h2>\n                        <div class="h5p-scroll-content"></div>\n                        <div class="h5p-close" role="button" tabindex="0" title="').concat(H5P.t("close"),'">\n                      </div>\n                    </div>')).insertAfter(n).click((function(){s.close()})).children(".h5p-inner").click((function(){return!1})).end();m(c.find(".h5p-close"),(function(){return s.close()}));var d=c.find(".h5p-scroll-content");return d.append(e("<div>",{class:"h5p-cp-print-ingress",id:l,html:i.printIngress})),H5P.JoubelUI.createButton({html:i.printAllSlides,class:"h5p-cp-print-all-slides",click:function(){s.close(),r(!0)}}).appendTo(d),H5P.JoubelUI.createButton({html:i.printCurrentSlide,class:"h5p-cp-print-current-slide",click:function(){s.close(),r(!1)}}).appendTo(d),this.open=function(){setTimeout((function(){c.addClass("h5p-open"),H5P.jQuery(s).trigger("dialog-opened",[c])}),1)},this.close=function(){c.removeClass("h5p-open"),setTimeout((function(){c.remove()}),200)},this.open(),c},i}(H5P.jQuery);const y=b,S=function(e){const t=e.length;return function i(){const n=Array.prototype.slice.call(arguments,0);return n.length>=t?e.apply(null,n):function(){const e=Array.prototype.slice.call(arguments,0);return i.apply(null,n.concat(e))}}},w=S((function(e,t){t.forEach(e)})),x=(S((function(e,t){return t.map(e)})),S((function(e,t){return t.filter(e)}))),T=(S((function(e,t){return t.some(e)})),S((function(e,t){return-1!=t.indexOf(e)}))),k=S((function(e,t){return x((t=>!T(t,e)),t)})),C=S(((e,t)=>t.getAttribute(e))),E=S(((e,t,i)=>i.setAttribute(e,t))),P=S(((e,t)=>t.removeAttribute(e))),$=S(((e,t)=>t.hasAttribute(e))),I=(S(((e,t,i)=>i.getAttribute(e)===t)),S(((e,t)=>{const i=C(e,t);E(e,("true"!==i).toString(),t)})),S(((e,t)=>e.appendChild(t))),S(((e,t)=>t.querySelector(e))),S(((e,t)=>{return i=t.querySelectorAll(e),Array.prototype.slice.call(i);var i})),S(((e,t)=>e.removeChild(t))),S(((e,t)=>t.classList.contains(e))),S(((e,t)=>t.classList.add(e)))),A=S(((e,t)=>t.classList.remove(e))),B=I("hidden"),H=A("hidden"),M=(S(((e,t)=>(e?H:B)(t))),S(((e,t,i)=>{i.classList[t?"add":"remove"](e)})),P("tabindex")),L=(w(M),E("tabindex","0")),j=E("tabindex","-1"),D=$("tabindex");class O{constructor(e){Object.assign(this,{listeners:{},on:function(e,t,i){const n={listener:t,scope:i};return this.listeners[e]=this.listeners[e]||[],this.listeners[e].push(n),this},fire:function(e,t){return(this.listeners[e]||[]).every((function(e){return!1!==e.listener.call(e.scope||this,t)}))},propagate:function(e,t){let i=this;e.forEach((e=>t.on(e,(t=>i.fire(e,t)))))}}),this.plugins=e||[],this.elements=[],this.negativeTabIndexAllowed=!1,this.on("nextElement",this.nextElement,this),this.on("previousElement",this.previousElement,this),this.on("firstElement",this.firstElement,this),this.on("lastElement",this.lastElement,this),this.initPlugins()}addElement(e){this.elements.push(e),this.firesEvent("addElement",e),1===this.elements.length&&this.setTabbable(e)}insertElementAt(e,t){this.elements.splice(t,0,e),this.firesEvent("addElement",e),1===this.elements.length&&this.setTabbable(e)}removeElement(e){this.elements=k([e],this.elements),D(e)&&(this.setUntabbable(e),this.elements[0]&&this.setTabbable(this.elements[0])),this.firesEvent("removeElement",e)}count(){return this.elements.length}firesEvent(e,t){const i=this.elements.indexOf(t);return this.fire(e,{element:t,index:i,elements:this.elements,oldElement:this.tabbableElement})}nextElement({index:e}){const t=e===this.elements.length-1,i=this.elements[t?0:e+1];this.setTabbable(i),i.focus()}firstElement(){const e=this.elements[0];this.setTabbable(e),e.focus()}lastElement(){const e=this.elements[this.elements.length-1];this.setTabbable(e),e.focus()}setTabbableByIndex(e){const t=this.elements[e];t&&this.setTabbable(t)}setTabbable(e){w(this.setUntabbable.bind(this),this.elements),L(e),this.tabbableElement=e}setUntabbable(e){e!==document.activeElement&&(this.negativeTabIndexAllowed?j(e):M(e))}previousElement({index:e}){const t=0===e,i=this.elements[t?this.elements.length-1:e-1];this.setTabbable(i),i.focus()}useNegativeTabIndex(){this.negativeTabIndexAllowed=!0,this.elements.forEach((e=>{e.hasAttribute("tabindex")||j(e)}))}initPlugins(){this.plugins.forEach((function(e){void 0!==e.init&&e.init(this)}),this)}}class K{constructor(){this.selectability=!0}init(e){this.boundHandleKeyDown=this.handleKeyDown.bind(this),this.controls=e,this.controls.on("addElement",this.listenForKeyDown,this),this.controls.on("removeElement",this.removeKeyDownListener,this)}listenForKeyDown({element:e}){e.addEventListener("keydown",this.boundHandleKeyDown)}removeKeyDownListener({element:e}){e.removeEventListener("keydown",this.boundHandleKeyDown)}handleKeyDown(e){switch(e.which){case 27:this.close(e.target),e.preventDefault(),e.stopPropagation();break;case 35:this.lastElement(e.target),e.preventDefault(),e.stopPropagation();break;case 36:this.firstElement(e.target),e.preventDefault(),e.stopPropagation();break;case 13:case 32:this.select(e.target),e.preventDefault(),e.stopPropagation();break;case 37:case 38:this.hasChromevoxModifiers(e)||(this.previousElement(e.target),e.preventDefault(),e.stopPropagation());break;case 39:case 40:this.hasChromevoxModifiers(e)||(this.nextElement(e.target),e.preventDefault(),e.stopPropagation())}}hasChromevoxModifiers(e){return e.shiftKey||e.ctrlKey}previousElement(e){!1!==this.controls.firesEvent("beforePreviousElement",e)&&(this.controls.firesEvent("previousElement",e),this.controls.firesEvent("afterPreviousElement",e))}nextElement(e){!1!==this.controls.firesEvent("beforeNextElement",e)&&(this.controls.firesEvent("nextElement",e),this.controls.firesEvent("afterNextElement",e))}select(e){this.selectability&&!1!==this.controls.firesEvent("before-select",e)&&(this.controls.firesEvent("select",e),this.controls.firesEvent("after-select",e))}firstElement(e){!1!==this.controls.firesEvent("beforeFirstElement",e)&&(this.controls.firesEvent("firstElement",e),this.controls.firesEvent("afterFirstElement",e))}lastElement(e){!1!==this.controls.firesEvent("beforeLastElement",e)&&(this.controls.firesEvent("lastElement",e),this.controls.firesEvent("afterLastElement",e))}disableSelectability(){this.selectability=!1}enableSelectability(){this.selectability=!0}close(e){!1!==this.controls.firesEvent("before-close",e)&&(this.controls.firesEvent("close",e),this.controls.firesEvent("after-close",e))}}function F(e){return F="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},F(e)}function W(e,t,i){var n;return n=function(e,t){if("object"!=F(e)||!e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!=F(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(t,"string"),(t="symbol"==F(n)?n:n+"")in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}var N="none",z="not-answered",R="answered",Q="has-only-correct",U="has-incorrect",G=function(e){function t(e){this.cp=e,this.answeredLabels=W(W(W(W(W({},z,this.cp.l10n.containsNotCompleted+"."),R,this.cp.l10n.containsCompleted+"."),Q,this.cp.l10n.containsOnlyCorrect+"."),U,this.cp.l10n.containsIncorrectAnswers+"."),N,""),this.initProgressbar(this.cp.slidesWithSolutions),this.initFooter(),this.initTaskAnsweredListener(),this.toggleNextAndPreviousButtonDisabled(this.cp.getCurrentSlideIndex())}return t.prototype.initTaskAnsweredListener=function(){var e=this;this.cp.elementInstances.forEach((function(t,i){t.filter((function(e){return a(e.on)})).forEach((function(t){t.on("xAPI",(function(t){var n=t.getVerb();if(d(["interacted","answered","attempted"],n)){var r=e.cp.slideHasAnsweredTask(i);e.setTaskAnswered(i,r)}else if("completed"===n){var s=e.cp.slideHasAnsweredTask(i);e.setTaskAnswered(i,s),t.setVerb("answered")}void 0===t.data.statement.context.extensions&&(t.data.statement.context.extensions={}),t.data.statement.context.extensions["http://id.tincanapi.com/extension/ending-point"]=i+1}))}))}))},t.prototype.initProgressbar=function(t){var i=this,n=i.cp.previousState&&i.cp.previousState.progress||0;this.progresbarKeyboardControls=new O([new K]),this.progresbarKeyboardControls.negativeTabIndexAllowed=!0,this.progresbarKeyboardControls.on("select",(function(t){i.displaySlide(e(t.element).data("slideNumber"))})),this.progresbarKeyboardControls.on("beforeNextElement",(function(e){return e.index!==e.elements.length-1})),this.progresbarKeyboardControls.on("beforePreviousElement",(function(e){return 0!==e.index})),void 0!==this.cp.progressbarParts&&this.cp.progressbarParts&&this.cp.progressbarParts.forEach((function(e){i.progresbarKeyboardControls.removeElement(e.children("a").get(0)),e.remove()})),i.cp.progressbarParts=[];for(var r=function(t){t.preventDefault();var n=e(this).data("slideNumber");i.progresbarKeyboardControls.setTabbableByIndex(n),i.displaySlide(n),i.cp.focus()},s=0;s<this.cp.slides.length;s+=1){var o=this.cp.slides[s],a=this.createSlideTitle(s),l=e("<div>",{class:"h5p-progressbar-part",id:"progressbar-part-"+s,role:"tab","aria-label":a,"aria-controls":"slide-"+s,"aria-selected":!1}).appendTo(i.cp.$progressbar),d=e("<a>",{href:"#",html:'<span class="h5p-progressbar-part-title hidden-but-read">'+a+"</span>",tabindex:"-1"}).data("slideNumber",s).click(r).appendTo(l);if(this.progresbarKeyboardControls.addElement(d.get(0)),this.isSummarySlide(s)&&l.addClass("progressbar-part-summary-slide"),c||H5P.Tooltip(l.get(0),{position:"top"}),0===s&&l.addClass("h5p-progressbar-part-show"),s===n&&l.addClass("h5p-progressbar-part-selected").attr("aria-selected",!0),i.cp.progressbarParts.push(l),this.updateSlideTitle(s),this.cp.slides.length<=60&&o.elements&&o.elements.length>0){var p=t[s]&&t[s].length>0,h=!!(i.cp.previousState&&i.cp.previousState.answered&&i.cp.previousState.answered[s]);p&&(e("<div>",{class:"h5p-progressbar-part-has-task"}).appendTo(d),this.setTaskAnswered(s,h))}}},t.prototype.displaySlide=function(e){var t=this;this.cp.jumpToSlide(e,!1,(function(){var i=t.cp.getCurrentSlideIndex();t.updateSlideTitle(e,{isCurrent:!0}),t.updateSlideTitle(i,{isCurrent:!1}),t.toggleNextAndPreviousButtonDisabled(e),t.cp.focus()}))},t.prototype.createSlideTitle=function(e){var t=this.cp.slides[e];return t.keywords&&t.keywords.length>0?t.keywords[0].main:this.isSummarySlide(e)?this.cp.l10n.summary:this.cp.l10n.slide+" "+(e+1)},t.prototype.isSummarySlide=function(e){return!(void 0!==this.cp.editor||e!==this.cp.slides.length-1||!this.cp.showSummarySlide)},t.prototype.initFooter=function(){var t=this,i=this,n=this.cp.$footer,r=e("<div/>",{class:"h5p-footer-left-adjusted"}).appendTo(n),s=e("<div/>",{class:"h5p-footer-center-adjusted"}).appendTo(n),o=e("<div/>",{role:"toolbar",class:"h5p-footer-right-adjusted"}).appendTo(n);this.cp.$keywordsButton=e("<div/>",{class:"h5p-footer-button h5p-footer-toggle-keywords","aria-expanded":"false","aria-label":this.cp.l10n.showKeywords,role:"button",tabindex:"0",html:'<span class="h5p-icon-menu"></span><span class="current-slide-title"></span>'}).appendTo(r),H5P.Tooltip(this.cp.$keywordsButton.get(0)),m(this.cp.$keywordsButton,(function(e){i.cp.presentation.keywordListAlwaysShow||(i.cp.toggleKeywords(),e.stopPropagation())})),!this.cp.presentation.keywordListAlwaysShow&&this.cp.initKeywords||this.cp.$keywordsButton.hide(),this.cp.presentation.keywordListEnabled||this.cp.$keywordsWrapper.add(this.$keywordsButton).hide(),this.updateFooterKeyword(0),this.cp.$prevSlideButton=e("<div/>",{class:"h5p-footer-button h5p-footer-previous-slide","aria-label":this.cp.l10n.prevSlide,role:"button",tabindex:"-1","aria-disabled":"true"}).appendTo(s),new H5P.Tooltip(this.cp.$prevSlideButton.get(0),{position:"left"}),m(this.cp.$prevSlideButton,(function(){return t.cp.previousSlide(void 0,!1)}));var a=e("<div/>",{class:"h5p-footer-slide-count"}).appendTo(s);this.cp.$footerCurrentSlide=e("<div/>",{html:"1",class:"h5p-footer-slide-count-current",title:this.cp.l10n.currentSlide,"aria-hidden":"true"}).appendTo(a),this.cp.$footerCounter=e("<div/>",{class:"hidden-but-read",html:this.cp.l10n.slideCount.replace("@index","1").replace("@total",this.cp.slides.length.toString())}).appendTo(s),e("<div/>",{html:"/",class:"h5p-footer-slide-count-delimiter","aria-hidden":"true"}).appendTo(a),this.cp.$footerMaxSlide=e("<div/>",{html:this.cp.slides.length,class:"h5p-footer-slide-count-max",title:this.cp.l10n.lastSlide,"aria-hidden":"true"}).appendTo(a),this.cp.$nextSlideButton=e("<div/>",{class:"h5p-footer-button h5p-footer-next-slide","aria-label":this.cp.l10n.nextSlide,role:"button",tabindex:"0"}).appendTo(s),H5P.Tooltip(this.cp.$nextSlideButton.get(0),{position:"right"}),m(this.cp.$nextSlideButton,(function(){return t.cp.nextSlide(void 0,!1)})),void 0===this.cp.editor&&(this.cp.$exitSolutionModeButton=e("<div/>",{role:"button",class:"h5p-footer-exit-solution-mode","aria-label":this.cp.l10n.solutionModeTitle,tabindex:"0"}).appendTo(o),H5P.Tooltip(this.cp.$exitSolutionModeButton.get(0)),m(this.cp.$exitSolutionModeButton,(function(){return i.cp.jumpToSlide(i.cp.slides.length-1)})),this.cp.enablePrintButton&&y.supported()&&(this.cp.$printButton=e("<div/>",{class:"h5p-footer-button h5p-footer-print","aria-label":this.cp.l10n.printTitle,role:"button",tabindex:"0"}).appendTo(o),H5P.Tooltip(this.cp.$printButton.get(0)),m(this.cp.$printButton,(function(){return i.openPrintDialog()}))),H5P.fullscreenSupported&&(this.cp.$fullScreenButton=e("<div/>",{class:"h5p-footer-button h5p-footer-toggle-full-screen","aria-label":this.cp.l10n.fullscreen,role:"button",tabindex:"0"}),H5P.Tooltip(this.cp.$fullScreenButton.get(0),{position:"left"}),m(this.cp.$fullScreenButton,(function(){return i.cp.toggleFullScreen()})),this.cp.$fullScreenButton.appendTo(o))),this.cp.$exitSolutionModeText=e("<div/>",{html:"",class:"h5p-footer-exit-solution-mode-text"}).appendTo(this.cp.$exitSolutionModeButton)},t.prototype.openPrintDialog=function(){var t=this,i=e(".h5p-wrapper");y.showDialog(this.cp.l10n,i,(function(e){y.print(t.cp,i,e)})).children('[role="dialog"]').focus()},t.prototype.updateProgressBar=function(e,t,i){var n,r=this;for(n=0;n<r.cp.progressbarParts.length;n+=1)e+1>n?r.cp.progressbarParts[n].addClass("h5p-progressbar-part-show"):r.cp.progressbarParts[n].removeClass("h5p-progressbar-part-show");r.progresbarKeyboardControls.setTabbableByIndex(e),r.cp.progressbarParts[e].addClass("h5p-progressbar-part-selected").attr("aria-selected",!0).siblings().removeClass("h5p-progressbar-part-selected").attr("aria-selected",!1),void 0!==t?!i&&r.cp.editor:r.cp.progressbarParts.forEach((function(e,t){r.setTaskAnswered(t,!1)}))},t.prototype.setTaskAnswered=function(e,t){this.cp.progressbarParts[e].find(".h5p-progressbar-part-has-task").toggleClass("h5p-answered",t),this.updateSlideTitle(e,{state:t?R:z})},t.prototype.updateSlideTitle=function(e){var t=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).state;this.setSlideTitle(e,{state:p(t,this.getAnsweredState(e))})},t.prototype.setSlideTitle=function(e,t){var i=t.state,n=void 0===i?N:i,r=this.cp.progressbarParts[e].find(".h5p-progressbar-part-title"),s=this.answeredLabels[n].replace("@slideName",this.createSlideTitle(e));r.html("".concat(s))},t.prototype.getAnsweredState=function(e){var t=this.cp.progressbarParts[e],i=this.slideHasInteraction(e),n=this.cp.slideHasAnsweredTask(e);return i?t.find(".h5p-is-correct").length>0?Q:t.find(".h5p-is-wrong").length>0?U:n?R:z:N},t.prototype.slideHasInteraction=function(e){return this.cp.progressbarParts[e].find(".h5p-progressbar-part-has-task").length>0},t.prototype.updateFooter=function(e){this.cp.$footerCurrentSlide.html(e+1),this.cp.$footerMaxSlide.html(this.cp.slides.length),this.cp.$footerCounter.html(this.cp.l10n.slideCount.replace("@index",(e+1).toString()).replace("@total",this.cp.slides.length.toString())),this.cp.isSolutionMode&&e===this.cp.slides.length-1?this.cp.$footer.addClass("summary-slide"):this.cp.$footer.removeClass("summary-slide"),this.toggleNextAndPreviousButtonDisabled(e),this.updateFooterKeyword(e)},t.prototype.toggleNextAndPreviousButtonDisabled=function(e){var t=this.cp.slides.length-1;this.cp.$prevSlideButton.attr("aria-disabled",(0===e).toString()),this.cp.$nextSlideButton.attr("aria-disabled",(e===t).toString()),this.cp.$prevSlideButton.attr("tabindex",0===e?"-1":"0"),this.cp.$nextSlideButton.attr("tabindex",e===t?"-1":"0")},t.prototype.updateFooterKeyword=function(e){var t=this.cp.slides[e],i="";t&&t.keywords&&t.keywords[0]&&(i=t.keywords[0].main),!this.cp.isEditor()&&this.cp.showSummarySlide&&e>=this.cp.slides.length-1&&(i=this.cp.l10n.summary),this.cp.$keywordsButton.children(".current-slide-title").html(p(i,""))},t}(H5P.jQuery);const q=G;var X=function(e){var t=e.presentation;t=n.extend(!0,{globalBackgroundSelector:{fillGlobalBackground:"",imageGlobalBackground:{}},slides:[{slideBackgroundSelector:{fillSlideBackground:"",imageSlideBackground:{}}}]},t);var i,r=function(t,i,n){var r=e.$slidesWrapper.children().filter(":not(.h5p-summary-slide)");void 0!==n&&(r=r.eq(n)),t&&""!==t?r.addClass("has-background").css("background-image","").css("background-color",t):i&&i.path&&r.addClass("has-background").css("background-color","").css("background-image","url("+H5P.getPath(i.path,e.contentId)+")")};i=t.globalBackgroundSelector,r(i.fillGlobalBackground,i.imageGlobalBackground),t.slides.forEach((function(e,t){var i=e.slideBackgroundSelector;i&&r(i.fillSlideBackground,i.imageSlideBackground,t)}))},J=function(e){return parseInt(e.dataset.index)},V=function(){function e(e){var t=this,i=e.l10n,n=e.currentIndex;this.l10n=i,this.state={currentIndex:p(n,0)},this.eventDispatcher=new r,this.controls=new O([new K]),this.controls.on("select",(function(e){t.onMenuItemSelect(J(e.element))})),this.controls.on("close",(function(){return t.eventDispatcher.trigger("close")})),this.menuElement=this.createMenuElement(),this.currentSlideMarkerElement=this.createCurrentSlideMarkerElement()}var t=e.prototype;return t.init=function(e){var t=this;return this.menuItemElements=e.map((function(e){return t.createMenuItemElement(e)})),this.menuItemElements.forEach((function(e){return t.menuElement.appendChild(e)})),this.menuItemElements.forEach((function(e){return t.controls.addElement(e)})),this.setCurrentSlideIndex(this.state.currentIndex),this.menuItemElements},t.on=function(e,t){this.eventDispatcher.on(e,t)},t.getElement=function(){return this.menuElement},t.removeAllMenuItemElements=function(){var e=this;this.menuItemElements.forEach((function(t){e.controls.removeElement(t),e.menuElement.removeChild(t)})),this.menuItemElements=[]},t.createMenuElement=function(){var e=this.menuElement=document.createElement("ol");return e.setAttribute("role","menu"),e.classList.add("list-unstyled"),e},t.createMenuItemElement=function(e){var t=this,i=document.createElement("li");return i.setAttribute("role","menuitem"),i.addEventListener("click",(function(e){t.onMenuItemSelect(J(e.currentTarget))})),this.applyConfigToMenuItemElement(i,e),i},t.applyConfigToMenuItemElement=function(e,t){e.innerHTML='<div class="h5p-keyword-subtitle">'.concat(t.subtitle,'</div><span class="h5p-keyword-title">').concat(t.title,"</span>"),e.dataset.index=t.index},t.onMenuItemSelect=function(e){this.setCurrentSlideIndex(e),this.eventDispatcher.trigger("select",{index:e})},t.setCurrentSlideIndex=function(e){var t=this.getElementByIndex(this.menuItemElements,e);t&&(this.state.currentIndex=e,this.updateCurrentlySelected(this.menuItemElements,this.state),this.controls.setTabbable(t))},t.updateCurrentlySelected=function(e,t){var i=this;e.forEach((function(e){var n=t.currentIndex===J(e);e.classList.toggle("h5p-current",n),n&&e.appendChild(i.currentSlideMarkerElement)}))},t.scrollToKeywords=function(e){var t=this.getFirstElementAfter(e);if(t){var i=n(this.menuElement),r=i.scrollTop()+n(t).position().top-8;l?i.scrollTop(r):i.stop().animate({scrollTop:r},250)}},t.getFirstElementAfter=function(e){return this.menuItemElements.filter((function(t){return J(t)>=e}))[0]},t.getElementByIndex=function(e,t){return e.filter((function(e){return J(e)===t}))[0]},t.createCurrentSlideMarkerElement=function(){var e=document.createElement("div");return e.classList.add("hidden-but-read"),e.innerHTML=this.l10n.currentSlide,e},e}(),Y="specified",_="next",Z="previous",ee=function(){function e(e,t){var i=this,s=e.title,o=e.goToSlide,a=void 0===o?1:o,l=e.invisible,c=e.goToSlideType,d=void 0===c?Y:c,p=t.l10n,h=t.currentIndex;this.eventDispatcher=new r;var u="h5p-press-to-go",f=0;if(l)s=void 0,f=-1;else{if(!s)switch(d){case Y:s=p.goToSlide.replace(":num",a.toString());break;case _:s=p.goToSlide.replace(":num",p.nextSlide);break;case Z:s=p.goToSlide.replace(":num",p.prevSlide)}u+=" h5p-visible"}var v=a-1;d===_?v=h+1:d===Z&&(v=h-1),this.$element=n("<a/>",{href:"#",class:u,tabindex:f,title:s}),m(this.$element,(function(e){i.eventDispatcher.trigger("navigate",v),e.preventDefault()}))}var t=e.prototype;return t.attach=function(e){e.html("").addClass("h5p-go-to-slide").append(this.$element)},t.on=function(e,t){this.eventDispatcher.on(e,t)},e}();const te=function(e){var t=this;if(void 0===e.action)t.instance=new ee(e,{l10n:t.parent.parent.l10n,currentIndex:t.parent.index}),t.parent.parent.isEditor()||t.instance.on("navigate",(function(e){var i=e.data;t.parent.parent.jumpToSlide(i),t.parent.parent.focus()}));else{var i;i=t.parent.parent.isEditor()?H5P.jQuery.extend(!0,{},e.action,t.parent.parent.elementsOverride):H5P.jQuery.extend(!0,e.action,t.parent.parent.elementsOverride);var n=t.parent.parent.elementInstances[t.parent.index]?t.parent.parent.elementInstances[t.parent.index].length:0;t.parent.parent.previousState&&t.parent.parent.previousState.answers&&t.parent.parent.previousState.answers[t.parent.index]&&t.parent.parent.previousState.answers[t.parent.index][n]&&(i.userDatas={state:t.parent.parent.previousState.answers[t.parent.index][n]}),i.params=i.params||{},t.instance=H5P.newRunnable(i,t.parent.parent.contentId,void 0,!0,{parent:t.parent.parent}),void 0!==t.instance.preventResize&&(t.instance.preventResize=!0)}void 0===t.parent.parent.elementInstances[t.parent.index]?t.parent.parent.elementInstances[t.parent.index]=[t.instance]:t.parent.parent.elementInstances[t.parent.index].push(t.instance),void 0!==t.instance.showCPComments||t.instance.isTask||void 0===t.instance.isTask&&void 0!==t.instance.showSolutions?(t.instance.coursePresentationIndexOnSlide=t.parent.parent.elementInstances[t.parent.index].length-1,void 0===t.parent.parent.slidesWithSolutions[t.parent.index]&&(t.parent.parent.slidesWithSolutions[t.parent.index]=[]),t.parent.parent.slidesWithSolutions[t.parent.index].push(t.instance)):e.solution&&(void 0===t.parent.parent.showCommentsAfterSolution[t.parent.index]&&(t.parent.parent.showCommentsAfterSolution[t.parent.index]=[]),t.parent.parent.showCommentsAfterSolution[t.parent.index].push(t.instance)),void 0!==t.instance.exportAnswers&&t.instance.exportAnswers&&(t.parent.parent.hasAnswerElements=!0),t.parent.parent.isTask||t.parent.parent.hideSummarySlide||(t.instance.isTask||void 0===t.instance.isTask&&void 0!==t.instance.showSolutions)&&(t.parent.parent.isTask=!0)};function ie(e){return ie="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},ie(e)}function ne(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,n)}return i}function re(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?ne(Object(i),!0).forEach((function(t){se(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):ne(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function se(e,t,i){var n;return n=function(e,t){if("object"!=ie(e)||!e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!=ie(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(t,"string"),(t="symbol"==ie(n)?n:n+"")in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function oe(e){var i,n=this;t().call(n,te,e.elements),n.getElement=function(){return i||(i=H5P.jQuery(oe.createHTML(re(re({},e),{},{index:n.index})))),i},n.setCurrent=function(){this.parent.$current=i.addClass("h5p-current")},n.appendElements=function(){for(var t=0;t<n.children.length;t++)n.parent.attachElement(e.elements[t],n.children[t].instance,i,n.index);n.parent.elementsAttached[n.index]=!0,n.parent.trigger("domChanged",{$target:i,library:"CoursePresentation",key:"newSlide"},{bubbles:!0,external:!0})}}oe.createHTML=function(e){return'<div role="tabpanel" id="slide-'+e.index+'" aria-labelledby="progressbar-part-'+e.index+'" class="h5p-slide"> <div role="document" tabindex="0" '+(void 0!==e.background?' style="background:'+e.background+'"':"")+"></div></div>"};const ae=oe;const le=function(e){var t=new H5P.ConfirmationDialog(e).appendTo(document.body);return t.getElement().classList.add("h5p-cp-confirmation-dialog"),t.show(),t};function ce(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var i=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=i){var n,r,s,o,a=[],l=!0,c=!1;try{if(s=(i=i.call(e)).next,0===t){if(Object(i)!==i)return;l=!1}else for(;!(l=(n=s.call(i)).done)&&(a.push(n.value),a.length!==t);l=!0);}catch(e){c=!0,r=e}finally{try{if(!l&&null!=i.return&&(o=i.return(),Object(o)!==o))return}finally{if(c)throw r}}return a}}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return de(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);"Object"===i&&e.constructor&&(i=e.constructor.name);if("Map"===i||"Set"===i)return Array.from(e);if("Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))return de(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function de(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,n=new Array(t);i<t;i++)n[i]=e[i];return n}function pe(e){return pe="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},pe(e)}var he=function(e,i,r){var s=this;this.presentation=e.presentation,this.slides=this.presentation.slides,this.contentId=i,this.elementInstances=[],this.elementsAttached=[],this.slidesWithSolutions=[],this.showCommentsAfterSolution=[],this.hasAnswerElements=!1,this.ignoreResize=!1,this.isTask=!1,this.standalone=!0,this.isReportingEnabled=!1,this.popups={},r.cpEditor&&(this.editor=r.cpEditor),r&&(this.previousState=r.previousState,this.standalone=r.standalone,this.isReportingEnabled=r.isReportingEnabled||r.isScoringEnabled),this.currentSlideIndex=this.previousState&&this.previousState.progress?this.previousState.progress:0,this.presentation.keywordListEnabled=void 0===e.presentation.keywordListEnabled||e.presentation.keywordListEnabled,this.l10n=n.extend({slide:"Slide",score:"Score",yourScore:"Your score",maxScore:"Max score",total:"Total",totalScore:"Total Score",showSolutions:"Show solutions",summary:"summary",retry:"Retry",exportAnswers:"Export text",close:"Close",hideKeywords:"Hide sidebar navigation menu",showKeywords:"Show sidebar navigation menu",fullscreen:"Fullscreen",exitFullscreen:"Exit fullscreen",prevSlide:"Previous slide",nextSlide:"Next slide",currentSlide:"Current slide",lastSlide:"Last slide",solutionModeTitle:"Exit solution mode",solutionModeText:"Solution Mode",summaryMultipleTaskText:"Multiple tasks",scoreMessage:"You achieved:",shareFacebook:"Share on Facebook",shareTwitter:"Share on Twitter",shareGoogle:"Share on Google+",goToSlide:"Go to slide :num",solutionsButtonTitle:"Show comments",printTitle:"Print",printIngress:"How would you like to print this presentation?",printAllSlides:"Print all slides",printCurrentSlide:"Print current slide",noTitle:"No title",accessibilitySlideNavigationExplanation:"Use left and right arrow to change slide in that direction whenever canvas is selected.",accessibilityProgressBarLabel:"Choose slide to display",containsNotCompleted:"@slideName contains not completed interaction",containsCompleted:"@slideName contains completed interaction",slideCount:"Slide @index of @total",accessibilityCanvasLabel:"Presentation canvas. Use left and right arrow to move between slides.",containsOnlyCorrect:"@slideName only has correct answers",containsIncorrectAnswers:"@slideName has incorrect answers",shareResult:"Share Result",accessibilityTotalScore:"You got @score of @maxScore points in total",accessibilityEnteredFullscreen:"Entered fullscreen",accessibilityExitedFullscreen:"Exited fullscreen",confirmDialogHeader:"Submit your answers",confirmDialogText:"This will submit your results, do you want to continue?",confirmDialogConfirmText:"Submit and see results",confirmDialogConfirmLabel:"Confirm",confirmDialogCancelLabel:"Cancel",slideshowNavigationLabel:"Slideshow navigation"},void 0!==e.l10n?e.l10n:{}),e.override&&(this.activeSurface=!!e.override.activeSurface,this.hideSummarySlide=!!e.override.hideSummarySlide,this.enablePrintButton=!!e.override.enablePrintButton,this.showSummarySlideSolutionButton=void 0===e.override.summarySlideSolutionButton||e.override.summarySlideSolutionButton,this.showSummarySlideRetryButton=void 0===e.override.summarySlideRetryButton||e.override.summarySlideRetryButton,e.override.social&&(this.enableTwitterShare=!!e.override.social.showTwitterShare,this.enableFacebookShare=!!e.override.social.showFacebookShare,this.enableGoogleShare=!!e.override.social.showGoogleShare,this.twitterShareStatement=e.override.social.twitterShare.statement,this.twitterShareHashtags=e.override.social.twitterShare.hashtags,this.twitterShareUrl=e.override.social.twitterShare.url,this.facebookShareUrl=e.override.social.facebookShare.url,this.facebookShareQuote=e.override.social.facebookShare.quote,this.googleShareUrl=e.override.social.googleShareUrl)),this.keywordMenu=new V({l10n:this.l10n,currentIndex:void 0!==this.previousState?this.previousState.progress:0}),this.setElementsOverride(e.override),t().call(this,ae,e.presentation.slides),this.on("resize",this.resize,this),this.on("printing",(function(e){s.ignoreResize=!e.data.finished,e.data.finished?s.resize():e.data.allSlides&&s.attachAllElements()}))};(he.prototype=Object.create(t().prototype)).constructor=he,he.prototype.getCurrentState=function(){var e=this,t=this.previousState?this.previousState:{};t.progress=this.getCurrentSlideIndex()||null,t.answers||(t.answers=[]),t.answered=this.elementInstances.map((function(t,i){return e.slideHasAnsweredTask(i)||null}));for(var i=0;i<this.elementInstances.length;i++)if(this.elementInstances[i])for(var n=0;n<this.elementInstances[i].length;n++){var r=this.elementInstances[i][n];(r.getCurrentState instanceof Function||"function"==typeof r.getCurrentState)&&(t.answers[i]||(t.answers[i]=[]),t.answers[i][n]=r.getCurrentState())}return t},he.prototype.slideHasAnsweredTask=function(e){return(this.slidesWithSolutions[e]||[]).filter((function(e){return a(e.getAnswerGiven)})).some((function(e){return e.getAnswerGiven()&&!H5P.isEmpty(e.getCurrentState())}))},he.prototype.attach=function(e){var t=this,i=this;void 0!==this.isRoot&&this.isRoot()&&this.setActivityStarted();var r='<div class="h5p-keymap-explanation hidden-but-read">'+(!this.activeSurface&&this.l10n.accessibilitySlideNavigationExplanation)+'</div><div class="h5p-fullscreen-announcer hidden-but-read" aria-live="polite"></div><div class="h5p-wrapper" tabindex="0" role="region" aria-roledescription="carousel" aria-label="'+(!this.activeSurface&&this.l10n.accessibilityCanvasLabel)+'">  <div class="h5p-current-slide-announcer hidden-but-read" aria-live="polite"></div>  <div tabindex="-1"></div>  <div class="h5p-box-wrapper">    <div class="h5p-presentation-wrapper">      <div class="h5p-keywords-wrapper"></div>     <div class="h5p-slides-wrapper"></div>    </div>  </div>  <nav class="h5p-cp-navigation" aria-label="'+this.l10n.slideshowNavigationLabel+'">    <div class="h5p-progressbar" role="tablist" aria-label="'+this.l10n.accessibilityProgressBarLabel+'"></div>  </nav>  <div class="h5p-footer"></div></div>';e.attr("role","application").addClass("h5p-course-presentation").html(r),this.$container=e,this.$slideAnnouncer=e.find(".h5p-current-slide-announcer"),this.$fullscreenAnnouncer=e.find(".h5p-fullscreen-announcer"),this.$slideTop=this.$slideAnnouncer.next(),this.$wrapper=e.children(".h5p-wrapper"),this.activeSurface&&this.$wrapper.addClass("h5p-course-presentation-active-surface"),this.$wrapper.focus((function(){i.initKeyEvents()})).blur((function(){void 0!==i.keydown&&(H5P.jQuery("body").unbind("keydown",i.keydown),delete i.keydown)})).click((function(e){var t=H5P.jQuery(e.target),n=i.belongsToTagName(e.target,["input","textarea","a","button"],e.currentTarget),r=i.hasTabIndex(e.target,e.currentTarget),s=t.closest(".h5p-popup-container"),o=0!==s.length;if(!n&&!r&&!i.editor)if(o){var a=t.closest("[tabindex]");1===a.closest(".h5p-popup-container").length?a.focus():s.find(".h5p-close-popup").focus()}else i.$wrapper.focus();i.presentation.keywordListEnabled&&!i.presentation.keywordListAlwaysShow&&i.presentation.keywordListAutoHide&&!t.is("textarea, .h5p-icon-pencil, span")&&i.hideKeywords()})),this.on("exitFullScreen",(function(){t.$footer.removeClass("footer-full-screen"),t.$fullScreenButton.attr("aria-label",t.l10n.fullscreen),t.$fullscreenAnnouncer.html(t.l10n.accessibilityExitedFullscreen)})),this.on("enterFullScreen",(function(){t.$fullscreenAnnouncer.html(t.l10n.accessibilityEnteredFullscreen)}));var s=parseInt(this.$wrapper.css("width"));this.width=0!==s?s:640;var o=parseInt(this.$wrapper.css("height"));this.height=0!==o?o:400,this.ratio=16/9,this.fontSize=16,this.$boxWrapper=this.$wrapper.children(".h5p-box-wrapper");var a,l=this.$boxWrapper.children(".h5p-presentation-wrapper");if(this.$slidesWrapper=l.children(".h5p-slides-wrapper"),this.$keywordsWrapper=l.children(".h5p-keywords-wrapper"),this.$progressbar=this.$wrapper.find(".h5p-progressbar"),this.$footer=this.$wrapper.children(".h5p-footer"),this.initKeywords=void 0===this.presentation.keywordListEnabled||!0===this.presentation.keywordListEnabled||void 0!==this.editor,this.activeSurface&&void 0===this.editor&&(this.initKeywords=!1,this.$boxWrapper.css("height","100%")),this.isSolutionMode=!1,this.createSlides(),this.elementsAttached[this.currentSlideIndex]=!0,this.showSummarySlide=!1,this.hideSummarySlide?this.showSummarySlide=!this.hideSummarySlide:this.slidesWithSolutions.forEach((function(e){i.showSummarySlide=e.length})),void 0===this.editor&&(this.showSummarySlide||this.hasAnswerElements)){var c={elements:[],keywords:[]};this.slides.push(c),(a=H5P.jQuery(ae.createHTML(c)).appendTo(this.$slidesWrapper)).addClass("h5p-summary-slide"),this.isCurrentSlide(this.slides.length-1)&&(this.$current=a)}var d=this.getKeywordMenuConfig();d.length>0||this.isEditor()?(this.keywordMenu.init(d),this.keywordMenu.on("select",(function(e){return t.keywordClick(e.data.index)})),this.keywordMenu.on("close",(function(){return t.hideKeywords()})),this.keywordMenu.on("select",(function(){t.$currentKeyword=t.$keywords.children(".h5p-current")})),this.$keywords=n(this.keywordMenu.getElement()).appendTo(this.$keywordsWrapper),this.$currentKeyword=this.$keywords.children(".h5p-current"),void 0!==this.presentation.keywordListOpacity&&this.setKeywordsOpacity(this.presentation.keywordListOpacity),this.presentation.keywordListAlwaysShow&&this.showKeywords()):(this.$keywordsWrapper.remove(),this.initKeywords=!1),void 0===this.editor&&this.activeSurface?(this.$progressbar.add(this.$footer).remove(),H5P.fullscreenSupported&&(this.$fullScreenButton=H5P.jQuery("<div/>",{class:"h5p-toggle-full-screen","aria-label":this.l10n.fullscreen,role:"button",tabindex:0,appendTo:this.$wrapper}),H5P.Tooltip(this.$fullScreenButton.get(0),{position:"left"}),m(this.$fullScreenButton,(function(){return i.toggleFullScreen()})))):(this.initTouchEvents(),this.navigationLine=new q(this),this.previousState&&this.previousState.progress||this.setSlideNumberAnnouncer(0,!1),this.summarySlideObject=new g(this,a)),new X(this),this.previousState&&this.previousState.progress&&this.jumpToSlide(this.previousState.progress,!1,null,!1,!0)},he.prototype.belongsToTagName=function(e,t,i){if(!e)return!1;i=i||document.body,"string"==typeof t&&(t=[t]),t=t.map((function(e){return e.toLowerCase()}));var n=e.tagName.toLowerCase();return-1!==t.indexOf(n)||i!==e&&this.belongsToTagName(e.parentNode,t,i)},he.prototype.hasTabIndex=function(e,t){if(-1!==e.tabIndex)return!0;var i=n(e).parents();for(var r in i){if(-1!==i[r].tabIndex)return!0;if(t&&i[r]===t)return!1}return!1},he.prototype.updateKeywordMenuFromSlides=function(){this.keywordMenu.removeAllMenuItemElements();var e=this.getKeywordMenuConfig();return n(this.keywordMenu.init(e))},he.prototype.getKeywordMenuConfig=function(){var e=this;return this.slides.map((function(t,i){return{title:e.createSlideTitle(t),subtitle:"".concat(e.l10n.slide," ").concat(i+1),index:i}})).filter((function(e){return null!==e.title}))},he.prototype.createSlideTitle=function(e){var t=this.isEditor()?this.l10n.noTitle:null;return this.hasKeywords(e)?e.keywords[0].main:t},he.prototype.isEditor=function(){return void 0!==this.editor},he.prototype.hasKeywords=function(e){return void 0!==e.keywords&&e.keywords.length>0},he.prototype.createSlides=function(){for(var e=this,t=0;t<e.children.length;t++){var i=t===e.currentSlideIndex;e.children[t].getElement().appendTo(e.$slidesWrapper),i&&e.children[t].setCurrent(),(e.isEditor()||0===t||1===t||i)&&e.children[t].appendElements()}},he.prototype.hasScoreData=function(e){return"undefined"!==pe(e)&&"function"==typeof e.getScore&&"function"==typeof e.getMaxScore},he.prototype.getScore=function(){var e=this;return o(e.slidesWithSolutions).reduce((function(t,i){return t+(e.hasScoreData(i)?i.getScore():0)}),0)},he.prototype.getMaxScore=function(){var e=this;return o(e.slidesWithSolutions).reduce((function(t,i){return t+(e.hasScoreData(i)?i.getMaxScore():0)}),0)},he.prototype.setProgressBarFeedback=function(e){var t=this;void 0!==e&&e?e.forEach((function(e){var i=t.progressbarParts[e.slide-1].find(".h5p-progressbar-part-has-task");if(i.hasClass("h5p-answered")){var n=e.score>=e.maxScore;i.addClass(n?"h5p-is-correct":"h5p-is-wrong"),t.navigationLine.updateSlideTitle(e.slide-1)}})):this.progressbarParts.forEach((function(e){e.find(".h5p-progressbar-part-has-task").removeClass("h5p-is-correct").removeClass("h5p-is-wrong")}))},he.prototype.toggleKeywords=function(){this[this.$keywordsWrapper.hasClass("h5p-open")?"hideKeywords":"showKeywords"]()},he.prototype.hideKeywords=function(){this.$keywordsWrapper.hasClass("h5p-open")&&(void 0!==this.$keywordsButton&&(this.$keywordsButton.attr("aria-label",this.l10n.showKeywords),this.$keywordsButton.attr("aria-expanded","false"),this.$keywordsButton.focus()),this.$keywordsWrapper.removeClass("h5p-open"))},he.prototype.showKeywords=function(){this.$keywordsWrapper.hasClass("h5p-open")||(void 0!==this.$keywordsButton&&(this.$keywordsButton.attr("aria-label",this.l10n.hideKeywords),this.$keywordsButton.attr("aria-expanded","true")),this.$keywordsWrapper.addClass("h5p-open"),this.presentation.keywordListAlwaysShow||this.$keywordsWrapper.find('li[tabindex="0"]').focus())},he.prototype.setKeywordsOpacity=function(e){if(""!==this.$keywordsWrapper.css("background-color")){var t=ce(this.$keywordsWrapper.css("background-color").match(/\d+/g),3),i=t[0],n=t[1],r=t[2];this.$keywordsWrapper.css("background-color","rgba(".concat(i,", ").concat(n,", ").concat(r,", ").concat(e/100,")"))}},he.prototype.fitCT=function(){void 0===this.editor&&this.$current.find(".h5p-ct").each((function(){for(var e=100,t=H5P.jQuery(this),i=t.parent().height();t.outerHeight()>i&&(e--,t.css({fontSize:e+"%",lineHeight:e+65+"%"}),!(e<0)););}))},he.prototype.resize=function(){var e=this.$container.hasClass("h5p-fullscreen")||this.$container.hasClass("h5p-semi-fullscreen");if(!this.ignoreResize){this.$wrapper.css("width","auto");var t=this.$container.width(),i={};if(e){var n=this.$container.height();t/n>this.ratio&&(t=n*this.ratio,i.width=t+"px")}var r=t/this.width;i.height=t/this.ratio+"px",i.fontSize=this.fontSize*r+"px",void 0!==this.editor&&this.editor.setContainerEm(this.fontSize*r*.75),this.$wrapper.css(i),this.swipeThreshold=100*r;var s=this.elementInstances[this.$current.index()];if(void 0!==s)for(var o=this.slides[this.$current.index()].elements,a=0;a<s.length;a++){var l=s[a];void 0!==l.preventResize&&!1!==l.preventResize||void 0===l.$||o[a].displayAsButton||H5P.trigger(l,"resize")}this.fitCT()}},he.prototype.toggleFullScreen=function(){H5P.isFullscreen||this.$container.hasClass("h5p-fullscreen")||this.$container.hasClass("h5p-semi-fullscreen")?void 0!==H5P.exitFullScreen&&void 0!==H5P.fullScreenBrowserPrefix?H5P.exitFullScreen():void 0===H5P.fullScreenBrowserPrefix?H5P.jQuery(".h5p-disable-fullscreen").click():""===H5P.fullScreenBrowserPrefix?window.top.document.exitFullScreen():"ms"===H5P.fullScreenBrowserPrefix?window.top.document.msExitFullscreen():window.top.document[H5P.fullScreenBrowserPrefix+"CancelFullScreen"]():(this.$footer.addClass("footer-full-screen"),this.$fullScreenButton.attr("aria-label",this.l10n.exitFullscreen),H5P.fullScreen(this.$container,this),void 0===H5P.fullScreenBrowserPrefix&&H5P.jQuery(".h5p-disable-fullscreen").hide())},he.prototype.focus=function(){this.$wrapper.focus()},he.prototype.keywordClick=function(e){this.shouldHideKeywordsAfterSelect()&&this.hideKeywords(),this.jumpToSlide(e,!0)},he.prototype.shouldHideKeywordsAfterSelect=function(){return this.presentation.keywordListEnabled&&!this.presentation.keywordListAlwaysShow&&this.presentation.keywordListAutoHide&&void 0===this.editor},he.prototype.setElementsOverride=function(e){this.elementsOverride={params:{}},e&&(this.elementsOverride.params.behaviour={},e.showSolutionButton&&(this.elementsOverride.params.behaviour.enableSolutionsButton="on"===e.showSolutionButton),e.retryButton&&(this.elementsOverride.params.behaviour.enableRetry="on"===e.retryButton))},he.prototype.attachElements=function(e,t){if(void 0===this.elementsAttached[t]){var i=this.slides[t],n=this.elementInstances[t];if(void 0!==i.elements)for(var r=0;r<i.elements.length;r++)this.attachElement(i.elements[r],n[r],e,t);this.trigger("domChanged",{$target:e,library:"CoursePresentation",key:"newSlide"},{bubbles:!0,external:!0}),this.elementsAttached[t]=!0}},he.prototype.attachElement=function(e,t,i,n){var r=void 0!==e.displayAsButton&&e.displayAsButton,s=void 0!==e.buttonSize?"h5p-element-button-"+e.buttonSize:"",o="h5p-element"+(r?" h5p-element-button-wrapper":"")+(s.length?" "+s:""),a=H5P.jQuery("<div>",{class:o}).css({left:e.x+"%",top:e.y+"%",width:e.width+"%",height:e.height+"%"}).appendTo(i.children('[role="document"]').first()),l=void 0===e.backgroundOpacity||0===e.backgroundOpacity;if(a.toggleClass("h5p-transparent",l),r){this.createInteractionButton(e,t).appendTo(a)}else{var c=e.action&&e.action.library?this.getLibraryTypePmz(e.action.library):"other",d=H5P.jQuery("<div>",{class:"h5p-element-outer ".concat(c,"-outer-element")}).css({background:"rgba(255,255,255,"+(void 0===e.backgroundOpacity?0:e.backgroundOpacity/100)+")"}).appendTo(a),p=H5P.jQuery("<div>",{class:"h5p-element-inner"}).appendTo(d);if(t.on("set-size",(function(e){for(var t in e.data)a.get(0).style[t]=e.data[t]})),t.attach(p),void 0!==e.action&&"H5P.InteractiveVideo"===e.action.library.substr(0,20)){var h=function(){t.$container.addClass("h5p-fullscreen"),t.controls.$fullscreen&&t.controls.$fullscreen.remove(),t.hasFullScreen=!0,t.controls.$play.hasClass("h5p-pause")?t.$controls.addClass("h5p-autohide"):t.enableAutoHide()};void 0!==t.controls?h():t.on("controls",h)}this.setOverflowTabIndex()}return void 0!==this.editor?this.editor.processElement(e,a,n,t):(e.solution&&this.addElementSolutionButton(e,t,a),this.hasAnswerElements=this.hasAnswerElements||void 0!==t.exportAnswers),a},he.prototype.disableTabIndexes=function(){var e=this.$container.find(".h5p-popup-container");this.$tabbables=this.$container.find("a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]").filter((function(){var t=n(this),i=n.contains(e.get(0),t.get(0));if(t.data("tabindex"))return!0;if(!i){var r=t.attr("tabindex");return t.data("tabindex",r),t.attr("tabindex","-1"),!0}return!1}))},he.prototype.restoreTabIndexes=function(){this.$tabbables&&this.$tabbables.each((function(){var e=n(this),t=e.data("tabindex");e.hasClass("ui-slider-handle")?(e.attr("tabindex",0),e.removeData("tabindex")):void 0!==t?(e.attr("tabindex",t),e.removeData("tabindex")):e.removeAttr("tabindex")}))},he.prototype.createInteractionButton=function(e,t){var i,r,s=this,o=e.action.metadata?e.action.metadata.title:"";""!==o&&void 0!==o||(o=(null===(i=e.action)||void 0===i||null===(i=i.params)||void 0===i?void 0:i.contentName)||(null===(r=e.action)||void 0===r||null===(r=r.params)||void 0===r?void 0:r.title)||e.action.library.split(" ")[0].split(".")[1]);var a=this.getLibraryTypePmz(e.action.library),l=n("<div>",{role:"button",tabindex:0,"aria-label":o,"aria-haspopup":"dialog","aria-expanded":!1,class:"h5p-element-button h5p-element-button-".concat(e.buttonSize," ").concat(a,"-button")}),c=n('<div class="h5p-button-element"></div>');t.attach(c);var d="h5p-advancedtext"===a?{x:e.x,y:e.y}:null;return m(l,(function(){var e;l.attr("aria-expanded","true"),s.showInteractionPopup(t,l,c,a,(e=l,function(){return e.attr("aria-expanded","false")}),d)})),void 0!==e.action&&"H5P.InteractiveVideo"===e.action.library.substr(0,20)&&t.on("controls",(function(){t.controls.$fullscreen&&t.controls.$fullscreen.remove()})),l},he.prototype.showInteractionPopup=function(e,t,i,n,r){var s=this,o=arguments.length>5&&void 0!==arguments[5]?arguments[5]:null,l=function(){e.trigger("resize")};this.isEditor()||(this.on("exitFullScreen",l),this.showPopup({popupContent:i,$focusOnClose:t,parentPosition:o,remove:function(){arguments.length>0&&void 0!==arguments[0]&&arguments[0]||i.detach(),s.off("exitFullScreen",l),r()},classes:n,instance:e,keepInDOM:"h5p-interactivevideo"===n}),H5P.trigger(e,"resize"),"h5p-image"===n&&this.resizePopupImage(i),setTimeout((function(){var e=i.find(":input").add(i.find("[tabindex]"));e.length?e[0].focus():(i.attr("tabindex",0),i.focus())}),200),a(e.setActivityStarted)&&a(e.getScore)&&e.setActivityStarted())},he.prototype.getLibraryTypePmz=function(e){return(t=e.split(" ")[0],t.replace(/[\W]/g,"-")).toLowerCase();var t},he.prototype.resizePopupImage=function(e){var t=Number(e.css("fontSize").replace("px","")),i=e.find("img"),n=function(i,n){if(!(n/t<18.5)){var r=i/n;n=18.5*t,e.css({width:n*r,height:n})}};i.height()?n(i.width(),i.height()):i.one("load",(function(){n(this.width,this.height)}))},he.prototype.addElementSolutionButton=function(e,t,i){var r=this;t.showCPComments=function(){if(0===i.children(".h5p-element-solution").length&&(o=e.solution,v.html(o).text().trim()).length>0){var t=n("<div/>",{role:"button",tabindex:0,title:r.l10n.solutionsButtonTitle,"aria-haspopup":"dialog","aria-expanded":!1,class:"h5p-element-solution"}).append('<span class="joubel-icon-comment-normal"><span class="h5p-icon-shadow"></span><span class="h5p-icon-speech-bubble"></span><span class="h5p-icon-question"></span></span>').appendTo(i),s={x:e.x,y:e.y};e.displayAsButton||(s.x+=e.width-4,s.y+=e.height-12),m(t,(function(i){r.showPopup({popupContent:e.solution,$focusOnClose:t,parentPosition:s,updateAriaExpanded:!0}),t.attr("aria-expanded",!0),i.stopPropagation()}))}var o},void 0!==e.alwaysDisplayComments&&e.alwaysDisplayComments&&t.showCPComments()},he.prototype.showPopup=function(e){var t,i,r=this,s=e.popupContent,o=e.$focusOnClose,a=e.parentPosition,l=void 0===a?null:a,c=e.remove,d=e.classes,p=void 0===d?"h5p-popup-comment-field":d,h=e.instance,f=e.keepInDOM,v=void 0!==f&&f,g=e.updateAriaExpanded,b=this;if(this.popupId=void 0===this.popupId?0:this.popupId+1,this.closePopup=function(e){var n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];t?t=!1:(b.restoreTabIndexes(),n&&o.focus(),g&&o.attr("aria-expanded",!1),void 0!==c&&setTimeout((function(){c(v)}),100),e&&e.preventDefault(),i.addClass("h5p-animate"),i.find(".h5p-popup-container").addClass("h5p-animate"),setTimeout((function(){v?i.hide():i.remove()}),100))},v&&h&&b.popups[h.subContentId]&&(i=b.popups[h.subContentId]),void 0===i){var y=(i=n('<div class="h5p-popup-overlay '+p+'"><div class="h5p-popup-container" role="dialog"aria-modal="true" aria-live="true" aria-labelledby="popup-title-'+this.popupId+'"> <div role="button" tabindex="0" class="h5p-close-popup" title="'+this.l10n.close+'"></div><div class="h5p-popup-wrapper" role="document"></div></div></div>')).find(".h5p-popup-wrapper");s instanceof H5P.jQuery?y.append(s):y.html(s);var S="";y.children().each((function(e,t){t.setAttribute("id","popup-content-"+r.popupId+"-"+e),S+="popup-content-"+r.popupId+"-"+e+" "})),i.find(".h5p-popup-container").attr("aria-describedby",S),h&&h.subContentId&&(b.popups[h.subContentId]=i)}var w=i.find(".h5p-popup-container");return function(e,t,i){if(i){t.css({visibility:"hidden"}),e.prependTo(r.$wrapper);var n=t.height(),s=t.width(),o=e.height(),a=s*(100/e.width()),l=n*(100/o);if(a>50&&l>50)e.detach();else{a>l&&l<45&&(a=Math.sqrt(a*l),t.css({width:a+"%"}));a>90?a=90:a<22&&(a=22);var c=100-a-5,d=i.x;i.x>c?d=c:i.x<5&&(d=5);var p=100-(l=t.height()*(100/o))-10,h=i.y;i.y>p?h=p:i.y<10&&(h=10),e.detach(),t.css({left:d+"%",top:h+"%"})}}}(i,w,l),i.addClass("h5p-animate"),w.css({visibility:""}).addClass("h5p-animate"),0===i.parent().length?i.prependTo(this.$wrapper):i.show(),i.removeClass("h5p-animate").click(b.closePopup).find(".h5p-popup-container").removeClass("h5p-animate").click((function(){t=!0})).keydown((function(e){e.which===u&&b.closePopup(e)})).find(".h5p-close-popup").focus(),this.disableTabIndexes(),m(i.find(".h5p-close-popup"),(function(e){return b.closePopup(e)})),i},he.prototype.checkForSolutions=function(e){return void 0!==e.showSolutions||void 0!==e.showCPComments},he.prototype.initKeyEvents=function(){if(void 0===this.keydown&&!this.activeSurface){var e=this,t=!1;this.keydown=function(i){t||((37!==i.keyCode&&33!==i.keyCode||!e.previousSlide(void 0,!1))&&(39!==i.keyCode&&34!==i.keyCode||!e.nextSlide(void 0,!1))||(i.preventDefault(),t=!0),t&&setTimeout((function(){t=!1}),300))},H5P.jQuery("body").keydown(this.keydown)}},he.prototype.initTouchEvents=function(){var e,t,i,n,r,s,o=this,a=!1,l=!1,c=function(e){return{"-webkit-transform":e,"-moz-transform":e,"-ms-transform":e,transform:e}},d=c("");this.$slidesWrapper.bind("touchstart",(function(c){l=!1,i=e=c.originalEvent.touches[0].pageX,t=c.originalEvent.touches[0].pageY;var d=o.$slidesWrapper.width();n=0===o.currentSlideIndex?0:-d,r=o.currentSlideIndex+1>=o.slides.length?0:d,s=null,a=!0})).bind("touchmove",(function(d){var p=d.originalEvent.touches;a&&(o.$current.prev().addClass("h5p-touch-move"),o.$current.next().addClass("h5p-touch-move"),a=!1),i=p[0].pageX;var h=e-i;null===s&&(s=Math.abs(t-d.originalEvent.touches[0].pageY)>Math.abs(h)),1!==p.length||s||(d.preventDefault(),l||(h<0?o.$current.prev().css(c("translateX("+(n-h)+"px")):o.$current.next().css(c("translateX("+(r-h)+"px)")),o.$current.css(c("translateX("+-h+"px)"))))})).bind("touchend",(function(){if(!s){var t=e-i;if(t>o.swipeThreshold&&o.nextSlide(void 0,!1)||t<-o.swipeThreshold&&o.previousSlide(void 0,!1))return}o.$slidesWrapper.children().css(d).removeClass("h5p-touch-move")}))},he.prototype.updateTouchPopup=function(e,t,i,n){if(arguments.length<=0)void 0!==this.touchPopup&&this.touchPopup.remove();else{var r="";if(void 0!==this.$keywords&&void 0!==this.$keywords.children(":eq("+t+")").find("span").html())r+=this.$keywords.children(":eq("+t+")").find("span").html();else{var s=t+1;r+=this.l10n.slide+" "+s}void 0===this.editor&&t>=this.slides.length-1&&(r=this.l10n.showSolutions),void 0===this.touchPopup?this.touchPopup=H5P.jQuery("<div/>",{class:"h5p-touch-popup"}).insertAfter(e):this.touchPopup.insertAfter(e),n-.15*e.parent().height()<0?n=0:n-=.15*e.parent().height(),this.touchPopup.css({"max-width":e.width()-i,left:i,top:n}),this.touchPopup.html(r)}},he.prototype.previousSlide=function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=this.$current.prev();return!!i.length&&(t?this.processJumpToSlide(i.index(),e,!1):this.jumpToSlide(i.index(),e,null,!1))},he.prototype.nextSlide=function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=this.$current.next();return!!i.length&&(t?this.processJumpToSlide(i.index(),e,!1):this.jumpToSlide(i.index(),e,null,!1))},he.prototype.isCurrentSlide=function(e){return this.currentSlideIndex===e},he.prototype.getCurrentSlideIndex=function(){return this.currentSlideIndex},he.prototype.attachAllElements=function(){for(var e=this.$slidesWrapper.children(),t=0;t<this.slides.length;t++)this.attachElements(e.eq(t),t);void 0!==this.summarySlideObject&&this.summarySlideObject.updateSummarySlide(this.slides.length-1,!0)},he.prototype.processJumpToSlide=function(e,t,i){var n=this;if(void 0===this.editor&&this.contentId){var r=this.createXAPIEventTemplate("progressed");r.data.statement.object.definition.extensions["http://id.tincanapi.com/extension/ending-point"]=e+1,this.trigger(r)}if(!this.$current.hasClass("h5p-animate")){var s=this.$current.addClass("h5p-animate"),o=n.$slidesWrapper.children(),a=o.filter(":lt("+e+")");this.$current=o.eq(e).addClass("h5p-animate");var l=this.currentSlideIndex;this.currentSlideIndex=e,this.attachElements(this.$current,e);var c=this.$current.next();return c.length&&this.attachElements(c,e+1),this.setOverflowTabIndex(),setTimeout((function(){s.removeClass("h5p-current"),o.css({"-webkit-transform":"","-moz-transform":"","-ms-transform":"",transform:""}).removeClass("h5p-touch-move").removeClass("h5p-previous"),a.addClass("h5p-previous"),n.$current.addClass("h5p-current"),n.trigger("changedSlide",n.$current.index())}),1),setTimeout((function(){if(n.$slidesWrapper.children().removeClass("h5p-animate"),void 0===n.editor){var e=n.elementInstances[n.currentSlideIndex],t=n.slides[n.currentSlideIndex].elements;if(void 0!==e)for(var i=0;i<e.length;i++)t[i].displayAsButton||"function"!=typeof e[i].setActivityStarted||"function"!=typeof e[i].getScore||e[i].setActivityStarted()}}),250),void 0!==this.$keywords&&(this.keywordMenu.setCurrentSlideIndex(e),this.$currentKeyword=this.$keywords.find(".h5p-current"),t||this.keywordMenu.scrollToKeywords(e)),n.presentation.keywordListEnabled&&n.presentation.keywordListAlwaysShow&&n.showKeywords(),n.navigationLine&&(n.navigationLine.updateProgressBar(e,l,this.isSolutionMode),n.navigationLine.updateFooter(e),this.setSlideNumberAnnouncer(e,i)),n.summarySlideObject&&n.summarySlideObject.updateSummarySlide(e,!0),void 0!==this.editor&&void 0!==this.editor.dnb&&(this.editor.dnb.setContainer(this.$current),this.editor.dnb.blurAll()),this.trigger("resize"),this.fitCT(),!0}},he.prototype.jumpToSlide=function(e){var t=this,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,r=arguments.length>3&&void 0!==arguments[3]&&arguments[3],s=arguments.length>4&&void 0!==arguments[4]&&arguments[4];if(this.standalone&&this.showSummarySlide&&e===this.slides.length-1&&!this.isSolutionMode&&this.isReportingEnabled&&!s){if(this.currentSlideIndex===this.slides.length-1)return!1;var o=le({headerText:this.l10n.confirmDialogHeader,dialogText:this.l10n.confirmDialogText,confirmText:this.l10n.confirmDialogConfirmLabel,cancelText:this.l10n.confirmDialogCancelLabel});o.on("canceled",(function(){return!1})),o.on("confirmed",(function(){t.processJumpToSlide(e,i,r),n&&n()}))}else this.processJumpToSlide(e,i,r),n&&n()},he.prototype.setOverflowTabIndex=function(){void 0!==this.$current&&this.$current.find(".h5p-element-inner").each((function(){var e,t=n(this);this.classList.contains("h5p-table")&&(e=t.find(".h5p-table").outerHeight());var i=t.closest(".h5p-element-outer").innerHeight();void 0!==e&&null!==i&&e>i&&t.attr("tabindex",0)}))},he.prototype.setSlideNumberAnnouncer=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],i="";if(!this.navigationLine)return i;var n=this.slides[e];n.keywords&&n.keywords.length>0&&!this.navigationLine.isSummarySlide(e)&&(i+=this.l10n.slide+" "+(e+1)+": "),i+=this.navigationLine.createSlideTitle(e),this.$slideAnnouncer.html(i),t&&this.$slideTop.focus()},he.prototype.resetTask=function(){var e,t,i=arguments.length>0&&void 0!==arguments[0]&&arguments[0];null===(e=this.summarySlideObject)||void 0===e||e.toggleSolutionMode(!1);for(var n=0;n<this.elementInstances.length;n++)if(this.elementInstances[n])for(var r=0;r<this.elementInstances[n].length;r++){var s=this.elementInstances[n][r];s.resetTask&&s.resetTask()}null===(t=this.navigationLine)||void 0===t||t.updateProgressBar(0),this.$container&&(this.jumpToSlide(0,!1),this.closePopup&&this.closePopup(void 0,i))},he.prototype.showSolutions=function(){for(var e=!1,t=[],i=!1,n=0;n<this.slidesWithSolutions.length;n++){if(void 0!==this.slidesWithSolutions[n]){this.elementsAttached[n]||this.attachElements(this.$slidesWrapper.children(":eq("+n+")"),n),e||(this.jumpToSlide(n,!1),e=!0);for(var r=0,s=0,o=[],a=0;a<this.slidesWithSolutions[n].length;a++){var l=this.slidesWithSolutions[n][a];void 0!==l.addSolutionButton&&l.addSolutionButton(),l.showSolutions&&l.showSolutions(),l.showCPComments&&l.showCPComments(),void 0!==l.getMaxScore&&(s+=l.getMaxScore(),r+=l.getScore(),i=!0,o.push(l.coursePresentationIndexOnSlide))}t.push({indexes:o,slide:n+1,score:r,maxScore:s})}if(this.showCommentsAfterSolution[n])for(var c=0;c<this.showCommentsAfterSolution[n].length;c++)"function"==typeof this.showCommentsAfterSolution[n][c].showCPComments&&this.showCommentsAfterSolution[n][c].showCPComments()}if(i)return t},he.prototype.getSlideScores=function(e){for(var t=!0===e,i=[],n=!1,r=0;r<this.slidesWithSolutions.length;r++)if(void 0!==this.slidesWithSolutions[r]){this.elementsAttached[r]||this.attachElements(this.$slidesWrapper.children(":eq("+r+")"),r),t||(this.jumpToSlide(r,!1),t=!0);for(var s=0,o=0,a=[],l=0;l<this.slidesWithSolutions[r].length;l++){var c=this.slidesWithSolutions[r][l];void 0!==c.getMaxScore&&(o+=c.getMaxScore(),s+=c.getScore(),n=!0,a.push(c.coursePresentationIndexOnSlide))}i.push({indexes:a,slide:r+1,score:s,maxScore:o})}if(n)return i},he.prototype.getCopyrights=function(){var e,t=new H5P.ContentCopyrights;if(this.presentation&&this.presentation.globalBackgroundSelector&&this.presentation.globalBackgroundSelector.imageGlobalBackground){var i=this.presentation.globalBackgroundSelector.imageGlobalBackground,n=new H5P.MediaCopyright(i.copyright);n.setThumbnail(new H5P.Thumbnail(H5P.getPath(i.path,this.contentId),i.width,i.height)),t.addMedia(n)}for(var r=0;r<this.slides.length;r++){var s=new H5P.ContentCopyrights;if(s.setLabel(this.l10n.slide+" "+(r+1)),this.slides[r]&&this.slides[r].slideBackgroundSelector&&this.slides[r].slideBackgroundSelector.imageSlideBackground){var o=this.slides[r].slideBackgroundSelector.imageSlideBackground,a=new H5P.MediaCopyright(o.copyright);a.setThumbnail(new H5P.Thumbnail(H5P.getPath(o.path,this.contentId),o.width,o.height)),s.addMedia(a)}if(void 0!==this.elementInstances[r])for(var l=0;l<this.elementInstances[r].length;l++){var c=this.elementInstances[r][l];if(this.slides[r].elements[l].action){var d=this.slides[r].elements[l].action.params,p=this.slides[r].elements[l].action.metadata;e=void 0,void 0!==c.getCopyrights&&(e=c.getCopyrights()),void 0===e&&(e=new H5P.ContentCopyrights,H5P.findCopyrights(e,d,this.contentId,{metadata:p,machineName:c.libraryInfo.machineName}));var h=l+1;void 0!==d.contentName?h+=": "+d.contentName:void 0!==c.getTitle?h+=": "+c.getTitle():d.l10n&&d.l10n.name&&(h+=": "+d.l10n.name),e.setLabel(h),s.addContent(e)}}t.addContent(s)}return t},he.prototype.getXAPIData=function(){var e=this.createXAPIEventTemplate("answered"),t=e.getVerifiedStatementValue(["object","definition"]);H5P.jQuery.extend(t,{interactionType:"compound",type:"http://adlnet.gov/expapi/activities/cmi.interaction"});var i=this.getScore(),n=this.getMaxScore();e.setScoredResult(i,n,this,!0,i===n);var r=o(this.slidesWithSolutions).map((function(e){if(e&&e.getXAPIData)return e.getXAPIData()})).filter((function(e){return!!e}));return{statement:e.data.statement,children:r}},he.prototype.getContext=function(){return{type:"slide",value:this.currentSlideIndex+1}};const ue=he;H5P=H5P||{},H5P.Tooltip=H5P.Tooltip||function(){},H5P.CoursePresentation=ue})()})();;		(function(xopen, fetch, dataurls) {

			switch(location.protocol.split(':')[0]) {
				case 'http':
				case 'https':
					return;
			};

			const url2data	= function(oldurl) {
					switch(oldurl.split(':')[0]) {
						case 'blob':
							console.log('blob', oldurl);
						case 'data':
							return oldurl;
					}
					let urltoks	 = oldurl.replace(H5PIntegration.url, '.').split('/');
					if(urltoks[0] == '.') {
						urltoks.shift();
						const url	= urltoks.join('/');
						if(typeof dataurls[url]!=='undefined') {
							if(dataurls[url][0]=='application/json') {
								return 'data:application/json;text,' + dataurls[url][1];
							}
							return 'data:' + dataurls[url].join(';base64,');
						}
					}
					console.error('url not found:', oldurl);
					return "data:;text,";
			};
			window.fetch = function() {
				arguments[0]	= url2data(arguments[0]);
				return fetch.apply(this, arguments);
			};
			XMLHttpRequest.prototype.open = function() {
				arguments[1]	= url2data(arguments[1]);
				return xopen.apply(this, arguments);
			};
		})(XMLHttpRequest.prototype.open, window.fetch, {"libraries\/H5PEditor.ShowWhen-1.0\/library.json":["application\/json","{\"machineName\":\"H5PEditor.ShowWhen\",\"title\":\"Toggle visibility of a field based on rules\",\"license\":\"MIT\",\"author\":\"fnoks\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":9,\"runnable\":0,\"preloadedJs\":[{\"path\":\"h5p-show-when.js\"}],\"preloadedCss\":[{\"path\":\"h5p-show-when.css\"}]}"],"libraries\/H5P.Image-1.1\/library.json":["application\/json","{\"title\":\"Image\",\"contentType\":\"Media\",\"description\":\"Simple library that displays an image.\",\"majorVersion\":1,\"minorVersion\":1,\"patchVersion\":22,\"runnable\":0,\"machineName\":\"H5P.Image\",\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":19},\"preloadedJs\":[{\"path\":\"image.js\"}],\"preloadedCss\":[{\"path\":\"image.css\"}],\"metadataSettings\":{\"disable\":0,\"disableExtraTitleField\":1},\"editorDependencies\":[{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/FontAwesome-4.5\/library.json":["application\/json","{\"title\":\"Font Awesome\",\"contentType\":\"Font\",\"majorVersion\":4,\"minorVersion\":5,\"patchVersion\":4,\"runnable\":0,\"machineName\":\"FontAwesome\",\"license\":\"MIT\",\"author\":\"Dave Gandy\",\"preloadedCss\":[{\"path\":\"h5p-font-awesome.min.css\"}]}"],"libraries\/H5PEditor.Shape-1.0\/library.json":["application\/json","{\"title\":\"H5PEditor.Shape\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":0,\"runnable\":0,\"machineName\":\"H5PEditor.Shape\",\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":12},\"preloadedCss\":[{\"path\":\"styles\\\/shape.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5}]}"],"libraries\/H5PEditor.ColorSelector-1.3\/library.json":["application\/json","{\"title\":\"H5PEditor.ColorSelector\",\"majorVersion\":1,\"minorVersion\":3,\"patchVersion\":1,\"runnable\":0,\"machineName\":\"H5PEditor.ColorSelector\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":24},\"author\":\"Joubel\",\"preloadedJs\":[{\"path\":\"scripts\\\/spectrum.js\"},{\"path\":\"scripts\\\/color-selector.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/spectrum.css\"},{\"path\":\"styles\\\/color-selector.css\"}]}"],"libraries\/H5P.Shape-1.0\/library.json":["application\/json","{\"title\":\"Shapes\",\"description\":\"Makes it possible to create different shapes.\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":5,\"runnable\":0,\"author\":\"Joubel\",\"license\":\"MIT\",\"machineName\":\"H5P.Shape\",\"metadataSettings\":{\"disable\":1,\"disableExtraTitleField\":1},\"preloadedCss\":[{\"path\":\"css\\\/h5p-shape.css\"}],\"preloadedJs\":[{\"path\":\"js\\\/h5p-shape.js\"}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.Shape\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.ColorSelector\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.AdvancedText-1.1\/library.json":["application\/json","{\"title\":\"Text\",\"description\":\"A simple library that displays text with all kinds of styling.\",\"majorVersion\":1,\"minorVersion\":1,\"patchVersion\":14,\"runnable\":0,\"machineName\":\"H5P.AdvancedText\",\"author\":\"Joubel\",\"preloadedJs\":[{\"path\":\"text.js\"}],\"preloadedCss\":[{\"path\":\"text.css\"}],\"metadataSettings\":{\"disable\":0,\"disableExtraTitleField\":1}}"],"libraries\/H5P.FontIcons-1.0\/library.json":["application\/json","{\"title\":\"H5P.FontIcons\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":6,\"runnable\":0,\"machineName\":\"H5P.FontIcons\",\"author\":\"Joubel\",\"preloadedCss\":[{\"path\":\"styles\\\/h5p-font-icons.css\"}]}"],"libraries\/H5P.Transition-1.0\/library.json":["application\/json","{\"machineName\":\"H5P.Transition\",\"title\":\"Transition\",\"description\":\"Contains helper function relevant for transitioning\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":4,\"runnable\":0,\"preloadedJs\":[{\"path\":\"transition.js\"}]}"],"libraries\/H5P.JoubelUI-1.3\/library.json":["application\/json","{\"title\":\"Joubel UI\",\"contentType\":\"Utility\",\"description\":\"UI utility library\",\"majorVersion\":1,\"minorVersion\":3,\"patchVersion\":19,\"runnable\":0,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":3},\"machineName\":\"H5P.JoubelUI\",\"author\":\"Joubel\",\"preloadedJs\":[{\"path\":\"js\\\/joubel-help-dialog.js\"},{\"path\":\"js\\\/joubel-message-dialog.js\"},{\"path\":\"js\\\/joubel-progress-circle.js\"},{\"path\":\"js\\\/joubel-simple-rounded-button.js\"},{\"path\":\"js\\\/joubel-speech-bubble.js\"},{\"path\":\"js\\\/joubel-throbber.js\"},{\"path\":\"js\\\/joubel-tip.js\"},{\"path\":\"js\\\/joubel-slider.js\"},{\"path\":\"js\\\/joubel-score-bar.js\"},{\"path\":\"js\\\/joubel-progressbar.js\"},{\"path\":\"js\\\/joubel-ui.js\"}],\"preloadedCss\":[{\"path\":\"css\\\/joubel-help-dialog.css\"},{\"path\":\"css\\\/joubel-message-dialog.css\"},{\"path\":\"css\\\/joubel-progress-circle.css\"},{\"path\":\"css\\\/joubel-simple-rounded-button.css\"},{\"path\":\"css\\\/joubel-speech-bubble.css\"},{\"path\":\"css\\\/joubel-tip.css\"},{\"path\":\"css\\\/joubel-slider.css\"},{\"path\":\"css\\\/joubel-score-bar.css\"},{\"path\":\"css\\\/joubel-progressbar.css\"},{\"path\":\"css\\\/joubel-ui.css\"},{\"path\":\"css\\\/joubel-icon.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.Transition\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.FontIcons\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.ContinuousText-1.2\/library.json":["application\/json","{\"title\":\"Continuous Text\",\"contentType\":\"Static content\",\"description\":\"A library that handles splitting up a large text into several div-containers in a Course Presentation.\",\"majorVersion\":1,\"minorVersion\":2,\"patchVersion\":16,\"runnable\":0,\"machineName\":\"H5P.ContinuousText\",\"author\":\"Joubel\",\"preloadedJs\":[{\"path\":\"scripts\\\/ct.js\"}]}"],"libraries\/H5PEditor.UrlField-1.2\/library.json":["application\/json","{\"title\":\"Url Field\",\"description\":\"Url field widget with protocol and path\",\"majorVersion\":1,\"minorVersion\":2,\"patchVersion\":2,\"runnable\":0,\"machineName\":\"H5PEditor.UrlField\",\"author\":\"Joubel\",\"preloadedJs\":[{\"path\":\"link-widget.js\"}],\"preloadedCss\":[{\"path\":\"link-widget.css\"}]}"],"libraries\/H5P.Link-1.3\/library.json":["application\/json","{\"title\":\"Link\",\"description\":\"A library for display a single link.\",\"majorVersion\":1,\"minorVersion\":3,\"patchVersion\":18,\"runnable\":0,\"metadataSettings\":{\"disable\":1,\"disableExtraTitleField\":1},\"machineName\":\"H5P.Link\",\"author\":\"Joubel\",\"preloadedJs\":[{\"path\":\"link.js\"}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.UrlField\",\"majorVersion\":1,\"minorVersion\":2}]}"],"libraries\/H5P.TwitterUserFeed-1.0\/library.json":["application\/json","{\"title\":\"Twitter User Feed\",\"description\":\"Displays a Twitter User Feed\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":21,\"runnable\":1,\"author\":\"Joubel\",\"license\":\"MIT\",\"machineName\":\"H5P.TwitterUserFeed\",\"preloadedJs\":[{\"path\":\"twitter-user-feed.js\"}],\"preloadedCss\":[{\"path\":\"twitter-user-feed.css\"}],\"metadataSettings\":{\"disable\":1,\"disableExtraTitleField\":1}}"],"libraries\/H5PEditor.RadioSelector-1.2\/library.json":["application\/json","{\"title\":\"H5PEditor.RadioSelector\",\"majorVersion\":1,\"minorVersion\":2,\"patchVersion\":2,\"runnable\":0,\"machineName\":\"H5PEditor.RadioSelector\",\"author\":\"Joubel\",\"preloadedJs\":[{\"path\":\"radio-selector.js\"}],\"preloadedCss\":[{\"path\":\"radio-selector.css\"}]}"],"libraries\/H5P.AudioRecorder-1.0\/library.json":["application\/json","{\"title\":\"Audio Recorder\",\"description\":\"Record audio and download it\",\"machineName\":\"H5P.AudioRecorder\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":33,\"runnable\":1,\"author\":\"Joubel\",\"license\":\"MIT\",\"embedTypes\":[\"iframe\"],\"preloadedCss\":[{\"path\":\"fonts\\\/h5p-audio-recorder-font-open-sans.css\"}],\"preloadedJs\":[{\"path\":\"dist\\\/h5p-audio-recorder.js\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.FontIcons\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.DragNDrop-1.1\/library.json":["application\/json","{\"title\":\"Drag N Drop\",\"contentType\":\"API\",\"description\":\"Provides a simple api for moving elements around. Could be used for sorting lists and etc.\",\"majorVersion\":1,\"minorVersion\":1,\"patchVersion\":5,\"runnable\":0,\"machineName\":\"H5P.DragNDrop\",\"author\":\"Frode Petterson\",\"preloadedJs\":[{\"path\":\"drag-n-drop.js\"}]}"],"libraries\/H5P.DragNResize-1.2\/library.json":["application\/json","{\"title\":\"Drag'N Resize\",\"contentType\":\"API\",\"description\":\"A library that aims to make resize operations easier for other libraries.\",\"majorVersion\":1,\"minorVersion\":2,\"patchVersion\":6,\"runnable\":0,\"machineName\":\"H5P.DragNResize\",\"author\":\"Frode Petterson\",\"preloadedJs\":[{\"path\":\"H5P.DragNResize.js\"}],\"preloadedCss\":[{\"path\":\"H5P.DragNResize.css\"}]}"],"libraries\/H5P.DragNBar-1.5\/library.json":["application\/json","{\"title\":\"Drag N Bar\",\"contentType\":\"API\",\"description\":\"Creates a menu bar with items that can be dropped into the specified container.\",\"majorVersion\":1,\"minorVersion\":5,\"patchVersion\":22,\"runnable\":0,\"machineName\":\"H5P.DragNBar\",\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":24},\"preloadedJs\":[{\"path\":\"scripts\\\/drag-n-bar.js\"},{\"path\":\"scripts\\\/context-menu.js\"},{\"path\":\"scripts\\\/dialog.js\"},{\"path\":\"scripts\\\/drag-n-bar-element.js\"},{\"path\":\"scripts\\\/drag-n-bar-form-manager.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/drag-n-bar.css\"},{\"path\":\"styles\\\/dialog.css\"},{\"path\":\"styles\\\/context-menu.css\"},{\"path\":\"styles\\\/drag-n-bar-form-manager.css\"}],\"preloadedDependencies\":[{\"machineName\":\"H5P.DragNDrop\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5P.DragNResize\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5P.FontIcons\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.ExportableTextArea-1.3\/library.json":["application\/json","{\"title\":\"Exportable Text Area\",\"contentType\":\"Static content\",\"description\":\"Library that displays an area where the user may input text, which is exportable as a doc-file\",\"majorVersion\":1,\"minorVersion\":3,\"patchVersion\":17,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":19},\"runnable\":0,\"machineName\":\"H5P.ExportableTextArea\",\"author\":\"H5P Group\",\"metadataSettings\":{\"disable\":0,\"disableExtraTitleField\":1},\"preloadedJs\":[{\"path\":\"dist\\\/h5p-exportable-text-area.js\"}]}"],"libraries\/H5P.Question-1.5\/library.json":["application\/json","{\"title\":\"Question\",\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5,\"patchVersion\":15,\"runnable\":0,\"license\":\"MIT\",\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":7},\"preloadedCss\":[{\"path\":\"styles\\\/question.css\"},{\"path\":\"styles\\\/explainer.css\"}],\"preloadedJs\":[{\"path\":\"scripts\\\/question.js\"},{\"path\":\"scripts\\\/explainer.js\"},{\"path\":\"scripts\\\/score-points.js\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3}]}"],"libraries\/H5PEditor.TableList-1.0\/library.json":["application\/json","{\"machineName\":\"H5PEditor.TableList\",\"title\":\"H5P Editor Table List\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":4,\"runnable\":0,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":14},\"preloadedJs\":[{\"path\":\"h5p-editor-table-list.js\"}],\"preloadedCss\":[{\"path\":\"h5p-editor-table-list.css\"}]}"],"libraries\/H5PEditor.RangeList-1.0\/library.json":["application\/json","{\"machineName\":\"H5PEditor.RangeList\",\"title\":\"H5P Editor Range List\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":13,\"runnable\":0,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":14},\"preloadedJs\":[{\"path\":\"h5p-editor-range-list.js\"}],\"preloadedCss\":[{\"path\":\"h5p-editor-range-list.css\"}],\"preloadedDependencies\":[{\"machineName\":\"H5PEditor.TableList\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5PEditor.VerticalTabs-1.3\/library.json":["application\/json","{\"machineName\":\"H5PEditor.VerticalTabs\",\"title\":\"H5P Editor Vertical Tabs\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":3,\"patchVersion\":9,\"runnable\":0,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":24},\"preloadedJs\":[{\"path\":\"vertical-tabs.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/css\\\/vertical-tabs.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5}]}"],"libraries\/H5PEditor.SingleChoiceSetTextualEditor-1.0\/library.json":["application\/json","{\"machineName\":\"H5PEditor.SingleChoiceSetTextualEditor\",\"title\":\"H5P Editor Single Choice Set Textual Editor\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":10,\"runnable\":0,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":24},\"preloadedJs\":[{\"path\":\"h5peditor-ssc-editor.js\"}],\"preloadedCss\":[{\"path\":\"h5peditor-ssc-editor.css\"}]}"],"libraries\/H5P.SingleChoiceSet-1.11\/sounds\/positive-short.ogg":["audio\/ogg","T2dnUwACAAAAAAAAAACTqtpjAAAAADy2SHoBHgF2b3JiaXMAAAAAAkSsAAAAAAAAgLUBAAAAAAC4AU9nZ1MAAAAAAAAAAAAAk6raYwEAAADeV1h+EUT\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/8HA3ZvcmJpczQAAABBTzsgYW9UdVYgWzIwMTEwNDI0XSAoYmFzZWQgb24gWGlwaC5PcmcncyBsaWJWb3JiaXMpAAAAAAEFdm9yYmlzJUJDVgEAQAAAJHMYKkalcxaEEBpCUBnjHELOa+wZQkwRghwyTFvLJXOQIaSgQohbKIHQkFUAAEAAAIdBeBSEikEIIYQlPViSgyc9CCGEiDl4FIRpQQghhBBCCCGEEEIIIYRFOWiSgydBCB2E4zA4DIPlOPgchEU5WBCDJ0HoIIQPQriag6w5CCGEJDVIUIMGOegchMIsKIqCxDC4FoQENSiMguQwyNSDC0KImoNJNfgahGdBeBaEaUEIIYQkQUiQgwZByBiERkFYkoMGObgUhMtBqBqEKjkIH4QgNGQVAJAAAKCiKIqiKAoQGrIKAMgAABBAURTHcRzJkRzJsRwLCA1ZBQAAAQAIAACgSIqkSI7kSJIkWZIlWZIlWZLmiaosy7Isy7IsyzIQGrIKAEgAAFBRDEVxFAcIDVkFAGQAAAigOIqlWIqlaIrniI4IhIasAgCAAAAEAAAQNENTPEeURM9UVde2bdu2bdu2bdu2bdu2bVuWZRkIDVkFAEAAABDSaWapBogwAxkGQkNWAQAIAACAEYowxIDQkFUAAEAAAIAYSg6iCa0535zjoFkOmkqxOR2cSLV5kpuKuTnnnHPOyeacMc4555yinFkMmgmtOeecxKBZCpoJrTnnnCexedCaKq0555xxzulgnBHGOeecJq15kJqNtTnnnAWtaY6aS7E555xIuXlSm0u1Oeecc84555xzzjnnnOrF6RycE84555yovbmWm9DFOeecT8bp3pwQzjnnnHPOOeecc84555wgNGQVAAAEAEAQho1h3CkI0udoIEYRYhoy6UH36DAJGoOcQurR6GiklDoIJZVxUkonCA1ZBQAAAgBACCGFFFJIIYUUUkghhRRiiCGGGHLKKaeggkoqqaiijDLLLLPMMssss8w67KyzDjsMMcQQQyutxFJTbTXWWGvuOeeag7RWWmuttVJKKaWUUgpCQ1YBACAAAARCBhlkkFFIIYUUYogpp5xyCiqogNCQVQAAIACAAAAAAE\/yHNERHdERHdERHdERHdHxHM8RJVESJVESLdMyNdNTRVV1ZdeWdVm3fVvYhV33fd33fd34dWFYlmVZlmVZlmVZlmVZlmVZliA0ZBUAAAIAACCEEEJIIYUUUkgpxhhzzDnoJJQQCA1ZBQAAAgAIAAAAcBRHcRzJkRxJsiRL0iTN0ixP8zRPEz1RFEXTNFXRFV1RN21RNmXTNV1TNl1VVm1Xlm1btnXbl2Xb933f933f933f933f931dB0JDVgEAEgAAOpIjKZIiKZLjOI4kSUBoyCoAQAYAQAAAiuIojuM4kiRJkiVpkmd5lqiZmumZniqqQGjIKgAAEABAAAAAAAAAiqZ4iql4iqh4juiIkmiZlqipmivKpuy6ruu6ruu6ruu6ruu6ruu6ruu6ruu6ruu6ruu6ruu6ruu6rguEhqwCACQAAHQkR3IkR1IkRVIkR3KA0JBVAIAMAIAAABzDMSRFcizL0jRP8zRPEz3REz3TU0VXdIHQkFUAACAAgAAAAAAAAAzJsBTL0RxNEiXVUi1VUy3VUkXVU1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU3TNE0TCA1ZCQCQAQCQEFMtLcaaCYskYtJqq6BjDFLspbFIKme1t8oxhRi1XhqHlFEQe6kkY4pBzC2k0CkmrdZUQoUUpJhjKhVSDlIgNGSFABCaAeBwHECyLECyLAAAAAAAAACQNA3QPA+wNA8AAAAAAAAAJE0DLE8DNM8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEDSNEDzPEDzPAAAAAAAAADQPA\/wPBHwRBEAAAAAAAAALM8DNNEDPFEEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEDSNEDzPEDzPAAAAAAAAACwPA\/wRBHQPBEAAAAAAAAALM8DPFEEPNEDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAQ4AAAEGAhFBqyIgCIEwBwSBIkCZIEzQNIlgVNg6bBNAGSZUHToGkwTQAAAAAAAAAAAAAkTYOmQdMgigBJ06Bp0DSIIgAAAAAAAAAAAACSpkHToGkQRYCkadA0aBpEEQAAAAAAAAAAAADPNCGKEEWYJsAzTYgiRBGmCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAYcAAACDChDBQasiIAiBMAcDiKZQEAgOM4lgUAAI7jWBYAAFiWJYoAAGBZmigCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAABhwAAAIMKEMFBqyEgCIAgBwKIplAcexLOA4lgUkybIAlgXQPICmAUQRAAgAAChwAAAIsEFTYnGAQkNWAgBRAAAGxbEsTRNFkqRpmieKJEnTPE8UaZrneZ5pwvM8zzQhiqJomhBFUTRNmKZpqiowTVUVAABQ4AAAEGCDpsTiAIWGrAQAQgIAHIpiWZrmeZ4niqapmiRJ0zxPFEXRNE1TVUmSpnmeKIqiaZqmqrIsTfM8URRF01RVVYWmeZ4oiqJpqqrqwvM8TxRF0TRV1XXheZ4niqJomqrquhBFUTRN01RNVXVdIIqmaZqqqqquC0RPFE1TVV3XdYHniaJpqqqrui4QTdNUVVV1XVkGmKZpqqrryjJAVVXVdV1XlgGqqqqu67qyDFBV13VdWZZlAK7rurIsywIAAA4cAAACjKCTjCqLsNGECw9AoSErAoAoAADAGKYUU8owJiGkEBrGJIQUQiYlpdJSqiCkUlIpFYRUSiolo5RSailVEFIpqZQKQiollVIAANiBAwDYgYVQaMhKACAPAIAwRinGGHNOIqQUY845JxFSijHnnJNKMeacc85JKRlzzDnnpJTOOeecc1JK5pxzzjkppXPOOeeclFJK55xzTkopJYTOQSellNI555wTAABU4AAAEGCjyOYEI0GFhqwEAFIBAAyOY1ma5nmiaJqWJGma53meKJqmJkma5nmeJ4qqyfM8TxRF0TRVled5niiKommqKtcVRdM0TVVVXbIsiqZpmqrqujBN01RV13VdmKZpqqrrui5sW1VV1XVlGbatqqrqurIMXNd1ZdmWgSy7ruzasgAA8AQHAKACG1ZHOCkaCyw0ZCUAkAEAQBiDkEIIIWUQQgohhJRSCAkAABhwAAAIMKEMFBqyEgBIBQAAjLHWWmuttdZAZ6211lprrYDMWmuttdZaa6211lprrbXWUmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaay2llFJKKaWUUkoppZRSSimllFJKBQD6VTgA+D\/YsDrCSdFYYKEhKwGAcAAAwBilGHMMQimlVAgx5px0VFqLsUKIMeckpNRabMVzzkEoIZXWYiyecw5CKSnFVmNRKYRSUkottliLSqGjklJKrdVYjDGppNZai63GYoxJKbTUWosxFiNsTam12GqrsRhjayottBhjjMUIX2RsLabaag3GCCNbLC3VWmswxhjdW4ultpqLMT742lIsMdZcAAB3gwMARIKNM6wknRWOBhcashIACAkAIBBSijHGGHPOOeekUow55pxzDkIIoVSKMcaccw5CCCGUjDHmnHMQQgghhFJKxpxzEEIIIYSQUuqccxBCCCGEEEopnXMOQgghhBBCKaWDEEIIIYQQSiilpBRCCCGEEEIIqaSUQgghhFJCKCGVlFIIIYQQQiklpJRSCiGEUkIIoYSUUkophRBCCKWUklJKKaUSSgklhBJSKSmlFEoIIZRSSkoppVRKCaGEEkopJaWUUkohhBBKKQUAABw4AAAEGEEnGVUWYaMJFx6AQkNWAgBkAACQopRSKS1FgiKlGKQYS0YVc1BaiqhyDFLNqVLOIOYklogxhJSTVDLmFEIMQuocdUwpBi2VGELGGKTYckuhcw4AAABBAICAkAAAAwQFMwDA4ADhcxB0AgRHGwCAIERmiETDQnB4UAkQEVMBQGKCQi4AVFhcpF1cQJcBLujirgMhBCEIQSwOoIAEHJxwwxNveMINTtApKnUgAAAAAAANAPAAAJBcABER0cxhZGhscHR4fICEiIyQCAAAAAAAGQB8AAAkJUBERDRzGBkaGxwdHh8gISIjJAEAgAACAAAAACCAAAQEBAAAAAAAAgAAAAQET2dnUwAAQDYAAAAAAACTqtpjAgAAAPAdYZ8gVUH\/IT05ZG1LR\/8qNjQzPDg2YV1S\/wze4OHc5Ofq8uREY\/DlwVRl7k3srpc9u8i66fdkoHOyTtfvu5pjtY2eiZ3E62GyAvHRmJ+2zs85WEyjuqvi7Zi3IZ8OfD+\/Uv9k6+GjB2\/5to+4Eg+qvj52ukQtrMNrvELIKojbKVZKbO1lMitwMl93cJCkWLNyLHvPctEu771P696H5vk0j\/U0F0\/afnrz6tlD\/9Or0h6Xq\/rR01ydTgCS6Pyz+SQbAqTwAY4SnX82n2UjHDSf4BCHQuF4dBcoOJJ0ZkTTEZWOqFgIiYQQAicvyZx8+ftuad\/PL+V5v8TS0nybM19tm5cAANjfOPt8m6Zp\/9fzNOX8ZWZi+t77B59vH77B7n2+H\/oksNmcg\/n\/Y\/x\/9AcagMP3w+Fwvp9MOJnQnZxMkgYOfMjcnJOnOeS3wwEgM0kOv9y94ZzmNN\/PwTg5wMnpf4D\/f7Zqk7Dz29nfmDqsTlU7fv79JNT307A5G4oDlXyHOkDZa\/+oGlHg3K\/O2XtURfxvZRQ\/g5+OP3SCc5JzkuvPFABsgA\/scxyf+e4YTJQT8P0lZTLDKdIA\/nZ3d1\/v\/z\/8+TA+Pj4+bgFUa4H\/fx9gOM7\/P4CDDAKcRipZwVnqNFKhCu6qQ\/\/XbT5WrEQAHgpAIbWPsd9OssdnnsY3n\/bzO+ZDsb82BQMa5IFqOqWtWm3gNtwCnERaD4w9FJxGSgjGDm66VtaADYxnAH5XtGs0arFFWgI1QxeznnJRJADceBbjwBLxQRxJLaVWlksAnEjKsnBwIknKwsX6WmVZZort55mZWa1WMzai38YBkGUw6orpgB9ZTkyK2zj7RBMTiJumkdaisVETH+tIJK6CYjwkmo7jFcbGRCrExQVNj7an6tGGMYnHxFQbRsNESTQ2iPenAARPuooXCp50FS+0cqvVarVa+qtNWVuWKau1Vclqs1q3thSVmpqiKIqIrdVq6a9CAGA1bGq3W1E11Gp3tHmsEVExYtVatVisVaNGjFgRY7dbTXW02cRUuy3JtHSiKumRSILExDh0NBqNRokLpQIsXzrTw4RrCdOZHiY8VqvIqFNPqKqpjSon1brVIqzSa5sSADFiRC1gMEZF1aiKipgiYrdagiAuGgpe51RXzx5KqqlQPZTSbbp4bAEMZYq1B4anQ5li7YHh+R4BAC6VeuupJdMBAIAMkWUmJRDUWGNUNZXSwtLEQlha6jAxp2dTnRaVJl3xPsS6jdBPu2zTiM5KAHKaLddFFCD61OWv5+jj97QeqkKJKHCaLddFFCD61OWv5+jj97QeqkKKgR8os4wiaisRlWoCAPwCAGS73W4nI8ZO9iC2lRWrqmIBADVGrVhFVI1EFjWRCAohRIagyMjA5mCzWtQQw9HBsBsqpgZMTDUB0VsoGn2SzqDVqYpiamaiMTOz1JpamklXV6XbUCrVQzU9NdWpREoSAstM4GAMAIY4BPxyRZnwSz3M6GEQbyumK4jGhAGhQgEQpIJlRR8WVhxgUiaJheUEWQBUquk21Uq3iY2EFkRiA8eFCiXVoalGSoSwOWBMR76rRkLy47UrzweIOE+Qaloplszr\/l7Zc8uhdaEMAuw52vM0qlueGSxvSyYBYqBtWEOmzvj0Wq0wWG1kJn3uBAHYAOzYsWjFUZsdOxatOGryAvCiDABUM1iYqka9wVw4kiBW2IwoFUQwnBVR91rTSZU8Emg5V0wcAczc4ZryRpu5w3XlDfoB1gghFQCoyaRCY1ZRtGZojIpMj+6isK4GwEsIhDJK3S0w11txkiXsXKut1WG6nWu1tTpMd4rMemvCIgQWAGLVGEEIwjAewI5LPKHCbg8Cp1pohPu1\/6miBx\/cWs9tCm56az23KbjpC7DZBCaAxkIsAFBUIVIHNcQ0E5iamalaIgkTRFGPdIDrFgCRIDbx0BLxaLvpJgHUWN\/N1SRcjfXdXE3CPkAVLAYggywwsVQNGDSaqm6qSNvpNj2a+gNNeiYfBOBl0\/RM56pgpr\/yANxY7yWFJjfWe0mhyQdYQWCZAhCZ1EEsYsEwTM1MhKmlpaWePZuWGtZQ6mtfqoGsP3Ascrk1ABzf0fKjcXxHy4\/GelFEUZN2+84iRFbLXG1EURSVmjo1NTU1RYT+0gIgRkWtWKvF0UHBYhVVCxgxRq0xxjUYa2oO4+NdIQYHcRBBisQEcXGON7G20XZ7tj3TSY\/00FEkNAAcYygVwdF7lKFUREfPlabIyGrUAdgxQ0zKjKhk5C7QzwAIqqoIslogqqY4ggE1WDEMm9XBBPQaLI1aXTwikYgTRoPAQSxxDqIBcsIEjhGRMAgVKprATjXaTrUvVQAEZa\/djyN7UPbYdRyc7hEAIHaAuB5dhgAQIiugCCrHjIpYsBcnk1Wt5gZzxdygWFhoTdIv6itJQXi46gnjuv0UaujggAF4Xut57eoq0K\/EXH0AOksuX1tRDYoWu3fwjLNb680cZ8nl6xTVoFqxewfvcXZrfZnjF0hRjZqyUldUq3XUrWZZU2+dalEb\/wAAAACByaiHrQ5VFVIFAABVUSMqeEHAGCuINWqNpkSqJinVAADMdBbC3KDTmJpKjZmJBarWQq9RFSm0Gq1Gq9G+mjmQSD2bVFBSqcRBGIlGwkgUE4g5RB4JAAjBoawCnxCIS6pHtxtUimoMBLFCmQBkW7YIwIEhM1BDa9FH2+03ywoAOR2rMgY\/YaCZ9K2a2A5XTBVNp7RVJE26KkKaSqwrrThqpotbg9ED7Tt1cKAJrY7F7lWAFg3T5LLXYsVAIBAWBQiFIyiXAHhAA2LcGqcA\/iueXzfRGbS6XXT\/d8jrff668iueX1fRGbS6Nbr\/J+X1Pn9dOQ+2xfQAeBpWllnc5CpWVQFAEbBYbA4IYDWxIACAAgBBbKKBEiYg0VAoNogYxSaIj0kYBxruxhEVRJDQQgRRCAIQioZFJjCWQ1Bgg7TqVI82lQpBNP7lu0YpaDoh6At4h8IGAZIcKIVtyFar11hz7EpQ5gr1aVG1qkC1q1WhkArFS4MAzzX21XaSYM4XWSE5H74N2eN7337uMXIad\/B3kSJus9EdoOPlS2zDkYbLNEDZ3ayZoQWhjToAnvtdPi6iN3hFu+B+hrzqs+sm97t8XERv8Ip2wf0MedVn180NI30BRdQFUTcTAPBJPg2qh5jFclmuqgAAqNVuEyq1YIoCqqKIUQAjBkAAAIJ6TAwkEiujwBFkMHJ4rHTExVhQkGUJAR82BVzVuBr\/hmhcBAAEIi1cRqt6RAoC2hY6TdvACCUUjIWEAABjxQbQO9243R95OMDCT4I0fF80DvlOVzyPi4BoJLrP1qPwLwIRQthwqLPJuL3TV1BE3FxEBchQjWrDcnnYbc2YcdxmDOBWPEOYg2wB24FGg1aOUQVe2z0+DtE4pEW76L5DnuvWy2e3XA5RDWnRPrrvsLr1ciMJXyDVVkDWFgkA8CSe1cI55lhVuQoAgIirpkHcDjYFEGNVVEAxagAAAAjiHRcJY8L4SCS2Uhj4uNEvAkM4IcUS4AAM8HUG6XbJZcBgnDBiMMgCiBMpHrpRiKhEkksEhBCCCVhcoSwtmlqTAklfEguwR0miceEGfu1cToscfFLvuKiQhaMptyAKIFGUH2mhftjRtu4tIbH\/zWzvQhR+8Kyhz47h9KwmdjgoDkEHog+0edLKap+TbvlhYuGQLPhhYRC+mt1fs+gNWdkuuE2ed4HJbDxmUQxZ2T64zXaBGwIfILKeEpQtAJ4MVAoxc85yVeViOQBAFtQ7ZUkwHAQFUDAiACJiCgAACqqIEhONBoTyCA5EV9eMCt2guCioGADJDt4A7ouepu1SAKnQqW6bfguKeVzsA5a4ip+EpvEhBFiSgnIogyyPIrRTey4OKGkj0lWsJbq\/Fi7TBP2JtN2WCZRWnXlFc\/HVaVYrkMl4DlPF\/iEwPXp6\/VaMGaRfDdSBEVVHpnWNElPX3n0eBiPvrQjAV8CGwsPjMyFQaEMEXmqN71M0B05VmP6nPq9qrZdSa3yfojlwqjFM\/1OfV1vr5XwBUQURlQwAgGsyuQfkylWssgqAqCBYrAGwatQqCIAAChAlLsYx8UH1mCGJRGICKYoTKs5BJMp56op3ORqQnm3TVCsliPT0fpQISyEOJSQrxLKRoFA6LwBwOQdA0u1ZVZUAgAIAK7JABQNQXapNkDbGhRVNOy5DPQgYG6boZPd9SL8dIq18sZN6q4MAJHY1WtnajvGJ76Rt18Aitj1sqTGjgVGAXauODvCA0sB6ANw4zoOC6B8MhG2GEeEk1mKiaVUA3qqdPg9RDdyhnv++RGZfBFq10+chqoE71PPfl8jsi4ZzhWBqqwAAXx8AMzEpZrFizrEqFgBTRVTE6giCiAUUQAAAcXBFQAEBAMBOpJYwcWLjE1oxJCQIYoYkrIWOscI2Xt9YvQAC4RgkAIJ7ucgwQEaB7IAgJwArlkQQYhBxkcDNGDsDhBDyExoMV2IUm8a89F5rObpBACDQxJM8j8BwhDqmcj+1+x6nte15YDBqg95gILoFnXYfIC+C7VzFro6xSEegYy7p588KFrRdj86zCdFGt1qtDvP88A165MwfWFplKYbG\/R4PvppdPnZRga+Q73+eROr8FbOaXT52UYGvkO9\/nkTm+SvmARIgJwAAwE4Gs4ucy7mqsixmAQAw1GaaVky7XQ01wNEuFlFTDQzKAABUSkqbIj3L1KiCBAQgYDrq6gl1dhoijMaFAAJsAH6ZSYMU2QCWCOmWiP+TUMTAHxVEx8Y7kCUAgAkEgAAMf3Wo8z7HGZEShAj6tZ2NYsKquq5bcjMvSChkegpjvlr+TAjSIofY79drSXs\/S7mPET\/r0VtN3PUzjxGCEKudYUMxVoRvS14Qh9ahxBUu\/uCjpYkOCP4Gdi3cLUnix3Qb4Y8GfnqdX7PIQZ+w\/Pvzo0ZmP8SFU+r8mkQO+rjl358vkdkPeRndkHJXAAC4PoCE1ZQI5rKqqpxlAQBQwxEHS7AadnUoAgAw1SYAABQkjEYULRETxkeDQYXRuqRQ0RjZIpI4pgAAAILWaoh5AKwQSgIAqQeWBgBCLwptCYxQX3sm6uOU5imQig+iCAEAWf7DrEa7IAUGaAREFhgQBvsOS+BEa7lWqu+ovnhvvwOj8YTSdPf5IRLtuEi9Jcj\/mb3XYTbSze6+1FaqeiGvWy5WOkCOtKGvFKpRQpCQHpnx6wciqCmQBs00wBeiEnJ0LEyps0EscQD+Oe2XURRA97b8\/LN1kfk7LPbwOe2XURRA99X\/\/LP1kfk7LPZ4JpZ1AwC4kgUws4RsZbmqqpIAINaCACCCiGkooAAAQEgQGxvEOvHEKiRaIRKtHGPbSlQ4EpuASAgQBeEEFsfj2ExAhTcxQx5BggAwYAXOVtT\/VpGo7cfKVqMr76nA6RAAWZR1pCtJ+Pk+BeQ2kSJ\/U6Q6TRJS6vWDJ98XNFYDBGFcX1JIjN1NpyCZoatimZBJhIEwPAcrwx6eXVw\/OoWjdeRowAUYdsz9bWkE4M5nULbulmaiNJ1\/iu03lYrEsgBPZ2c="],"libraries\/H5P.SingleChoiceSet-1.11\/sounds\/negative-short.mp3":["audio\/mpeg","SUQzAwAAAAA1bVRZRVIAAAAGAAAAMjAxNABUREFUAAAABgAAADExMTEAVElNRQAAAAYAAAAwODI2AFBSSVYAABKzAABYTVAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMjEgNzkuMTU1MjQxLCAyMDEzLzExLzI1LTIxOjEwOjQwICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICB4bWxuczp4bXBETT0iaHR0cDovL25zLmFkb2JlLmNvbS94bXAvMS4wL0R5bmFtaWNNZWRpYS8iCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YTQ3MDZlMzgtMWJlZi0wYTQxLThjYzgtNzdiMWRlYWQ5NTFjIgogICB4bXBNTTpEb2N1bWVudElEPSI1NjQxMTdkYi1iOWRlLTliODEtNDIxZS0wM2Q0MDAwMDAwNzUiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpmZTc5MDRiYi00YWEyLTAwNDQtODI4MS1kOWM3ODg0YzI2MGMiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMTQtMTEtMTFUMDg6MjY6MzYrMDE6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDE0LTExLTExVDA4OjI2OjM2KzAxOjAwIgogICB4bXA6Q3JlYXRlRGF0ZT0iMjAxNC0xMS0xMVQwODoyNjowNiswMTowMCIKICAgeG1wRE06YXVkaW9TYW1wbGVSYXRlPSI0NDEwMCIKICAgeG1wRE06YXVkaW9TYW1wbGVUeXBlPSIxNkludCIKICAgeG1wRE06YXVkaW9DaGFubmVsVHlwZT0iU3RlcmVvIgogICB4bXBETTpzdGFydFRpbWVTY2FsZT0iMzAwMDAiCiAgIHhtcERNOnN0YXJ0VGltZVNhbXBsZVNpemU9IjEwMDEiCiAgIGRjOmZvcm1hdD0iTVAzIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9Ijk1ZGI4OGU4LWExNTItMDVmZC00ZTJhLWRmNGEwMDAwMDBhMiIKICAgICAgc3RFdnQ6d2hlbj0iMjAxNC0xMS0xMVQwODoyNjozNiswMTowMCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgQWRvYmUgTWVkaWEgRW5jb2RlciBDQyAoV2luZG93cykiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9Ijg0ZGQxMTNiLTIxMDktNzJjYi1jYzc3LTE4M2QwMDAwMDBhMiIKICAgICAgc3RFdnQ6d2hlbj0iMjAxNC0xMS0xMVQwODoyNjoxMyswMTowMCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgQWRvYmUgTWVkaWEgRW5jb2RlciBDQyAoV2luZG93cykiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NjExZjAyMTYtZjEyMS0zNzRkLTlkMWQtNDUzNDVlOWVkNjc4IgogICAgICBzdEV2dDp3aGVuPSIyMDE0LTExLTExVDA4OjI2OjM2KzAxOjAwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBBZG9iZSBNZWRpYSBFbmNvZGVyIENDIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphNDcwNmUzOC0xYmVmLTBhNDEtOGNjOC03N2IxZGVhZDk1MWMiCiAgICAgIHN0RXZ0OndoZW49IjIwMTQtMTEtMTFUMDg6MjY6MzYrMDE6MDAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIEFkb2JlIE1lZGlhIEVuY29kZXIgQ0MgKFdpbmRvd3MpIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvbWV0YWRhdGEiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8eG1wTU06RGVyaXZlZEZyb20KICAgIHN0UmVmOmluc3RhbmNlSUQ9Ijg0ZGQxMTNiLTIxMDktNzJjYi1jYzc3LTE4M2QwMDAwMDBhMiIKICAgIHN0UmVmOmRvY3VtZW50SUQ9IjczZTA1NGZhLWExMmItYjVjMi1hNDE4LTgzZDIwMDAwMDA3NSIKICAgIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplM2IxMjgyMi01MjE5LWRjNGQtOWI1Yi1hNjQwNjU4Zjk0ZGQiLz4KICAgPHhtcERNOmR1cmF0aW9uCiAgICB4bXBETTp2YWx1ZT0iNzEiCiAgICB4bXBETTpzY2FsZT0iMTAwMS8zMDAwMCIvPgogICA8eG1wRE06c3RhcnRUaW1lY29kZQogICAgeG1wRE06dGltZUZvcm1hdD0iMjk5N0Ryb3BUaW1lY29kZSIKICAgIHhtcERNOnRpbWVWYWx1ZT0iMDA7MDA7MDA7MDAiLz4KICAgPHhtcERNOmFsdFRpbWVjb2RlCiAgICB4bXBETTp0aW1lVmFsdWU9IjAwOzAwOzAwOzAwIgogICAgeG1wRE06dGltZUZvcm1hdD0iMjk5N0Ryb3BUaW1lY29kZSIvPgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\/\/uQYAAABPE3TU1rAAAAAAlwoAABEAzLYvnKEhFaLKvrNUKCUVWVqqqMoOFghfcwoNjwMDGeRGaAAE2caUcRkZoAvlB9ygYABQBpJsgbANQYfA7oJCJENpMQ5LKSksfUdhY6m8jiD+Tkrn4YVOy+flEs5K7coct379Skxp7dR\/4fv4Ybr26kbl\/cMN188I3T9ww3nnqnp+4c3Xz1T0\/cObr56p7b1g+XPxO8H6wfLn4nCwP1g+t+kMcSHNYIcoc4YwwCACAgGBQKBgeQjAzoNjBQFMOkNdQoJTMZlMnBc\/2mDApQNkGYAgciG6ib8S9vX1Ayb8DcgQNQZB34CooO0GCAAngXBgmRAkRLwlZE3DFA6Bc4yiKTt5KEPJgpFNWr8wMjMwOHV\/\/MDh1SS0P\/9I6DQbNV\/1ExURBs17fz4DKH2KAAAAACAgEAoGA4HlcbLqgVTk0f\/OSLZa21T\/\/+bwMlIDMD4JDhfwBiYMqfGx\/0\/\/62\/6lJVX\/\/1Jfq\/\/rR9lJP2973XsntrRRZTu93392\/\/rUXrexjaJrgAAC3RyLX\/\/uQYAQAAkUPV79zAAxDAcr66TQBiQg7Ya2yJvD0Byy1hjTeYdh0WBRhmFmoBWYUCpgUAKBQFXpeZytf6YyYwT5zYhKZbKYYBXpdk\/\/\/\/\/\/\/+gxJyq0vaLnW1i508S352V+7\/1AAQCAABLfutYm8J6HBpMdl1BNRMEzMgr0VtjSAEsFf\/\/\/\/\/h0RWB1ij2IjSkETzr5Yc15aZqR0IsoFyKlucEALpuDURIBABAAAlvzeey\/wIFDVCUyb1MNCRIWFt1zyATQPRzEQavxfA8Gr\/\/\/\/\/\/Zcpy68Xcf1t9FpBpw4SjpPiE2Cb2VVPCRkclIpYCCSCgAALt4Ljc88V2UNBKL0lD2cOAEG1sZlo6YbAACTf\/\/\/\/\/ovuLJy7GaiIEvOJwMbZNvo0mlE0VM0VqiSUkiAALbfDTgzDTTEqhJSa5uH72SQwm+7M2FSmdCP0ixeKoAVRq4vRTlme\/\/\/\/qe0CuE3NmjxIQg1WLKp7ZK\/ztVtvQ4sYTeHRaLWOF2oYTiKJabQAAAG8phdmDRCBhJhqwkSx+l3F5wHLeXLN0HJKodj\/\/uQYDoAAowOV+tYebw8gestaxk3iaQ7U0295vEbh6s1vGjeeGcQjROLJu\/\/\/\/\/\/\/\/\/8iSHnVD5VPW7\/9GuQQWAABJJbbqOOYQtG2I4OBDDsABcRLU8H6YYD7RkrpsVr5vCQuNtb52ndv\/\/\/\/Y5dSMos4GUhEWJgY2vWxGUN20bEOCDq2WI9Gr3KysAJBSaAAAAuiUd1eDBCSGDwAQmP3L5RTNNBUm2lL\/s4iuRACp8uWrIyROOradSnv\/\/\/\/\/\/\/\/95eTCeB3pKXOjEMAYuqrHPqhKZJcQlAAt0gVvYQYUTydSWxjfGGAhAAgOhLFsIScUX719Qgj13FreE\/IwDRhySZ\/zA+5kkpai6igusxBX\/\/\/\/\/K9Zw8bY668+1ZI8xJ1QbkGOQu2VEvRSU0m6xKAAN24xC8zcSUzgGnkclM+BhEY2eCLN9YRDVzLfxJANaAn7cgKgTACDbyn311vnSxvZ\/\/\/\/\/\/\/88aLjFpYSgq5qnyoGHssKi6BWqVppb0IAASWXNMMGlk9CtRIKM1NOqQBkgSeCYg3RcajpN47\/GovGTZ\/\/uQYGeAAr0aVmuPokxQYertaxo3iXRNUU5jJzExh+kpzOja5Xo2MBGJFDtNzX6\/\/rPZ\/\/\/\/\/\/oxZ4G9HQsAI7K2ehC7n5FPWgoVgEAAG0qeFGYxEbygEodTEt\/M9BtDIx1TrLEmZI\/qYSI1DlhaHA0HwLMMPCwBAUdIK5trF\/4VAT3if\/\/\/\/\/\/\/Q63nnez7E0quQylJEgyRF2gASyJWAx7KTCJSWHEAHMCqkDMF+y+Mc7b5+XM7s2nU9kbiCw4MMACHA\/DEUon76P9SVanSOAosi0NDX\/\/\/\/\/\/\/6ka+Xt8nraRRUjRdsAkrAhwLMDCz7RpBYVAzFp8y8DMQKBAeFD2MjolLp6zKcKaGQaPvcL8YBCRA14kZI1SX89\/Zj5UvDYXOGr703f\/\/\/2WJ\/9n9l\/2V+xyk0Qp7WpsABdIQSATCHVMKhtCxOcwEXUq4xgxP9Z4P7PQu3NsFfKHJKvARjAgFwNihkFAEREnkUkXqWpX1nDBlIKTNz7Obqjlf\/\/\/\/\/+gVWnzTdsP+b3oasogKaQh2gSSvqhyOEnDgxhyWBBgg\/\/uQYIYAAmYa1OuYokxSwwqdbxRJiwB3Wa5iqTFZjOo1vDUmZuAmLgjkgV4KajjDFZ9WxT+Td0bJFnH5Y1sTEArP\/nv6CSmQOAuBkqYcV\/\/+TPtrUg52P3\/20s2sZe9NHSi1fQ0wBIAUcIcgAGz1DAbMPV4WSaTCvjBwbGj2LQCALOXG5ZWmOToJzwc6rd1yAESAFRsMymsape6zw1skbCB4mAWOPq\/\/\/\/\/\/7aQ4UcocwY16bEXb\/4ykAEBRsBNgNuRkKip04MjlZYwYXlGmpAmYnocsV3F08VsGxUxTJLRfHMDZxEAGRpq\/0DBkSQgOuEguedcr\/\/yVYnNnJUcba1lLyLN29xRiHUPnC5veKLallzEHml2rBRDkkQcgAEsrZucCDJhgAIAC4AUHQcc5VdHQC4bO4flm\/zp22TMoKd5AqEmHkJjYGcErvvJ+f\/\/\/\/zPus8\/\/m8qnAoJDbtIr\/\/\/\/\/\/lFsqYhVucF8pS75Ni0UjJZEXIALcYmKmV1oAEFwp3gEHMUgjMgZIGOAQQRkvYW7t2D4AdgoJczCKMoXYMD\/\/uQYJ2AAp4QUmuM0bRdQppNbfM5izBnUbXNgDGTCCq2t5AGHs8nQ4k54fqYNXYskoGDhFLv\/\/\/\/D5gJIGsehA8SUiAFS4NnscALBhiBwudQIIpbONcpRABpXmVWlJJptRqNRoxRLMHAKYUpqbDkaYbaedoI0NDO6xg8IBiEMhgUJJhWPatlCYqCKY6hyYCCNLxmEwQDDCQ5IyoT+G3mwAmQRSD5w\/UFjHVm7Q\/QLqhFg1WTLJJoO2N0Z4eB4IOYmpSMnv4swWUNEXGQMdDLUtFm75qQhEyKEYQ0d6SnUp0WshdPIOOQajwT5MESJxa2MlPXS\/f0Fm5Fx8C4ByCZImT5Ma0WMlJL2a7\/7zMnSJkwXi0X2QMy6T5cJ4tSSn1nf\/9NUumlRIQCAADebDZqS+YmOmWxwCJTBikOOzPidpJWVvEhKai1fl\/8\/hpllDY31EIp9vCEsBcwslRlci3vO\/\/\/\/\/6CZyJ1Hs70QGpxwCKfUFCP+J3z\/r6KVWqAFtuvVSCwHCxIPPRMBAkDAVMVmsUGACYVBidTOgMB1YX5vZNA\/\/uQYKQABk1e1VZ2YARW4hrazeQAisw9YV3CgDD3B2zrnvAGyLwkEA8\/\/8r86WcWy3Y7uIAUrFdSLHgFSjZErCrwbJXsdusp9oaeSQ4o21bSRVdMrfgAAbbqIkJqAHlYIEyrcPjj\/X5\/\/+8t6wXpuhBmYO\/\/\/\/\/9dgFJHGMmFldf3vGjFLZzbazly3KTb6nw6FBGrAltluo21AIEPDlRFqQtz3FRwJMidjZoqv+ct5VMxfu+sMhL+o+\/LrYikIFim+faSNL85Ib2db00a7VsCJQMbQ+95ZYHhDS74UvQhFDIJJTkcuuu3hl2YKJR9wkzz6X0KzgYFs4\/LHp8g4VNWUP1pHuiE3GEUfUh0A2a\/kUKpkfSisePYcRsetaexLrfmDGQ6EimknI3Lbbc7q5jAQ5PkIASAr9I8qxSNHgDDZ16iCI42Ou6oVmtTVYEreEcOouTr1aTkDFig23aAaePB4RGSTqsqHPd1EVlkLntL7BZrnMJfsHI6ERFRNyWDbbbd6GuLZOcrfs+vvCi+2bGwLWUY7\/cxDxc\/vHXRNDoBV9B\/\/uQYIgAAncOVtOYSbxEIbsdYeg3ipQ9Xa5pJvE8hyy1jDzeIHrFULc1GaQlvCqOsDoAkaei40wY6R+9BsRkGRe+j6+KuZRbL25kKJJKkackstsNNFC5iPh50u84LsKTjTRiY89GTmtLGevX2s5CZF+29i05iEWXFnmFA4lYCRXN6jFj6VCqFjniQ\/TYGSaRe2rFp8ox0NrDZsewFgMgWYg5rb+hWvoJCAKciYkssuVpuB3isg0AhacGvluoDC2LJ5R3+XIakVu9dsOmCixqxYN1i60Gf2NPYuo+fTLrLFBQwlzaXqgSsttSKrFxuxCx77UKdvsGbLfXUWJASJcSbkjbj6p3AEnmONgovMMYXs\/jAwwtGnTNJBRHlmeETQ42GZduGG+Px4JCRQOliwdNEJJ6SyvhNqCBASDlohBqGXXS6LO+l1S0t8yugU+\/rb79JRLSUscgllt\/SaQPj2bREqgrfxtuzrSlfRpsyFVLl3KwwqW0+q1PDI+qjs1rwJB5IQMG5o01TvxTbWIJpaQyWFJxC6ghbFMQlEVAdy50SEd6\/\/uQYKsAAuIOVWuYebxTQfqtazg3irw7Ta5p5vFtiCq1vWDehZENFVKNO1t9X6REBIFRttuOOVC55gAOG9K+iJG1VJ9syjatMFyQsebarl9rskJPeJH0Jd\/au5YINC54ChgkHFNNIbRbQ3pICYxXmWTTGmSXgeFT1wTHBM80cF7a+vbZ1crb\/HEgJFORtuRyXG4WAJ8nUhmmKKffKblsjgQ+xCiBs85P15sGhpJmlqbWwA6Umde5f88fE4XagbGyjKcstxGmSGO735nQ3eieFBUbk++7SlDpURjUofkNiRZqDCr1JbJbTlssttt1GvwMB57uQKvkFHYzjKVaZgEMiHerysJFxVa4ZwdgRx1Hpa82\/\/NEp5IkD9smTSTUlk03vuazaJ13oB0iVHb7ZFI9jL7Xbu9y+ieXtvU1S7I2IpxuWy23W3S99VkG\/vquOkNC3GU6XQSXMWowgHhivhhmoI97LvMQu4SVipXHp96n1LgNgMRBUqTvT6D7jpK48rYKCXbtc9l3fGi26T0WN9w9nspb9VrqAIimyXLJJI5AiiCg\/\/uQYLkAAs0RU2uYebxcIip9azg3iyBdWa496TFeCmt1nbzmMYEB5+Y2lAQh8Rgdg5AGPK4hgC1W\/+WEAmxYcqV9LTPV4AsR6ipq3KmWGF7\/5q6cBMKuD5tDXbBSxzDZkviu+2vQ2zCsXvcK\/jmrUFbEwEIoSnEpbbJJJKo6IwmeiHyXv4XkZXAr2qQUdRCNGpAgqfm1y1AAoAvNC4bvUKqoP9DdHRTuVPQVbOeG79uuZagXyD0NzZffuZxbU+CJpBm+pK5Z7CIvbcycVUpdKZRC6Mlo808MokpAuRxiRyV2l9jIYeOUojPChiPCZ\/J9RxeW9L0\/jwgCZQObHpj4BEvX57P6fPmXbVuznWpQLU6n8JLQZXYpA9JFyanPQaSj5BpraRI7rjcc500paBD3k3sULr0EBUeuVpv23HG3KVz18H1q8swVAlY514KF820OaWImjH5Bm\/XAMJmktTJ6G3XcsPdrTTiwTSYQG7qheH3yll96GEBSu3fYKO7P\/2nV93U0hV\/b0EUWyXI25JJLHVZhgOcCgpGIO4RAhxoovp+2\/\/uQYMQAAtwW0+uPwcxjorqNZ3g5i\/RXT62\/BzE8iWmpnTzeAMDirj2ToS\/S+8ddcARGXN85zJgINYi4YrItajuRQoAMel7e4LVKWZlSNiHVtknWX1qWQdL0r0n38VOiRZP6SCSiU422425lEXwOESBWxEKzaT9ZeTMEnzGKdB+ITeHKFgtFWv4WGNBNLVarn2fqWM8s8axhQXMqDSa+xjp\/mh4QW5rnpqN32jxf38qfNqdXLIZfXOJpW5XZ11akEWgXI24224\/j3paAWKpamc\/CBy1GNIpvdsCsW5Zw+1AKXjlzkzEb7xgI72ZX87uedk+GigKidA2GjB0qXYlYsbd2WVr1GHrYwo5cNf9yrGts9Pco63q8oj1IItEuRNuRtycZE9pOwXdjS2FIMTXy3jeqpGw7ETqK0fw5UTrld+XdwVXET72N\/yNBQ0ZHMn0oerloGEIYHC7izDwcIoMQGGCohHo1MWxL4ovQKIQIlCrnKndJc+zTd\/pARJaScbbjjbsNl5AaIaOjJ3xTKU5UbYO06uqqZHIc7GrN+UQ4geO0\/\/uQYMuAAsoSVGtPebxcQppdZ3g5izxJS61jBvF\/iCl1nWDe93nSx069EJhgSDKKhdL6zooIgoqxNlSVLSWpWQaiyjsr1fHNZ\/\/cRPKXQJAzKxdyyCECUknG2w4246TAUOgvNQKAx17Tb0BrNbukYclwOgHOlEvg+oXugWkrzteWi3r97O7Zs1N9piJJrhRZ3+W1fLsOvcYfz1qW7dg7QlRVRKm9rFdSz+r20aYCS\/\/7qH5CEK2GgahFMDGNkYbL2DYZV5uHI3Wm3eBpmuQzG56lggI2\/sts40vblq3Zp62d7CpVvWrf2LgLhQUNvMllumRszDbA+i01i65FJr7eqxMaLGUHmWs6CrAKJbc\/7q0bD+NhQARMQoAVTPa1AaLD+QaCPrVaxAr7R2lRNTohyr3xiR8s8sajr9Zcyyp7l7LdetUxDM9AZESJUL\/cIE6WqWLOSJ12I2uU7kRcz59GWX7534rtT5usRGv+qurlzc2vsFRaYyI2I0wlpIII\/UvEA3vgaLQ\/I3JWwy+WRe3xfAC5Dt\/G9jbq18bWJw2JhsBB\/\/uQYNIAAsYQ02s5YbxXAmpdY1g5i4xnQSxjCTF6i2hxjGDmFEnToGufTJ7T+1oZnRJbl21Wvd7kCe9V6vMUW6KbytRhDlEECE3brLdfv\/FyybQArVMBoAMwrA8a\/i6croBoi32U2IaqtXFSJmzkSjsw94fmKZ2a+\/q4fhzeeX2XAVjhZQktqxemzFWGiysgwdLdVWPeiLNWGnHXtY+KAQvP1sfuUSftavcKIIFJyT\/uvdlT7kjCAMVHVYBbt2lV+8UiJBN9QYR9lcMgysIOh6xDcwreBtZXCpTL6bI40JjhQEVBuXSmruQ1TKhlncUbcv7Foq7ozklwXQDuSWyfdphVv\/\/urcRFdpYQyXzHRicLTKVsaqWMsC8TaSKX559BBKcM7erWFZwdOD5Zcu51MqGjzqZidgUMJLEZljmq1JZ2TbjSFPvN7GPSeIvFnVRa76IaXGoysW\/0VLBAgotyf\/1b7J0SQ0IWkO6CSVaIZqpFQ3ckVmA7GFaVEMpIyuZhymKg5yhvtKZ76+FLfv3rdHTBxDwwFxZ9qakoBUYBWtDB\/\/uQYNsAAuQT0EsYwcxjosn9Yxg5CqxFRYxjJvFoCihlrODmgypiKLaFEHLnO779H99f\/v1tdUgQUm4\/\/qtpQVC7Y11x2SiEBF2vD61HwlIFyr2MPy\/lWLoAobSjnCb06HBL366eZYYckN1WuN+GBgGVHmxAcKnKBoBF2hLUP\/Z5tSP3211k10UJdTilNeylH+xNKKS2+233\/3h4KAy3J21QKNKbmIXoA3QaQw2L1XxlUYij\/YQwAcu5G4DpNyESVXj1iflOWVJdu4WrGh4AcCwhSAL7CLKSZ9QaNsaMICMbxd7GCdgp0GutZNs0+Td93pd\/o7qmSUlJI422m2sGic6RHOn0xEEzkRrquGIQsuIEUk6diqFVMQEADigmVP9uZnexaU2ZLr+2uRumo69fCpL9KMn2JDrWT6xIZUxirr2MzNj0IaY6EiiZkYpZhDUMegAsY4xSwVU79H+saJTMkf\/dXDhjIoIh05YqhprYwNDyM4yhgGyx7tnNtZc++2XG5zETQPK8sILZw1msNmzEgVrndJC4dBskLDxrwnLmU0MI\/\/uQYOGAAssU0OM4ycxbQtocYw85jFxVP61jByGZC6i1l+Eme1GbdS659slc70bkqu8nLV9sd98vT1toGzb\/7b\/fCKraZYcIMI+LeERCn3cigPK2CHAr5wrc9Kp1hi6UsZE8tPAZeQ6UGvYYQfGZNfs0tfdYcTaKtCCgVFT5lKSy2mRXQQ3KoLJNlrWD0PekKOou5o8R1o79lKKBScj\/\/q27r4EJxi5g4p5RA4+FH1Me3C4Kxc6fjMuYgJXacearjMfC7y\/uwuUSBJHkfzZvDyGwfFGUFpKxDVCq1nPrn0ZdCbka0UNcll+W7aFWt09PTs\/WigUm4\/\/6t4EHEqjoqUs3xYCNC4TISg0Ay1ENftyUSfamGUgcRoEupA\/IHRCCumXidUaGRybn0UkHQnGVProjii2lRRbzIeipm27nZT\/dSv3OcO9XalTf\/2O82GUm5LbJJI247KID\/gISNroHEhElb0RCoJVafRkvZilzaOBlRaKxjtphAIR9Bhlu7SYX7l7YqDA0UHsQT2pqPAdiKLHG+itBt166q+930daTVivp\/\/uQYOEAAt0V0ON4ecxfgon9bxk5CxhZQ4zh5zFrDShxrFEm2sXqtoPqQJSckv\/9Wqkpog0esL1hRkYTvaC1UpK4kTQCt+oC+8ONzf5dKlsOzE3mFyTd5XdDK7o5h\/bmVnoIoHigfDrHMUYax4sGpFzWSxh7q7F2CiX1Rt\/W\/ud+r0Na9Nf9sVQTTlt0kkjbmUG0pQqyRjJJaRiy98EJMhqCXEMJ7KgEQoRkgiTlcWRxD7gaYuIVFrFArQUit+eQOu7H3EzZ2KXpoZNPKGKZq+bFkNZ\/bfl7VV6EP0afr1zGxFqmU25bdJJI24+wNEKJGNesSmCScJJmVqODQX8f4hYphAb\/sF5DyFzmRSXWclwGvRAtJO1rt+xn+V\/HDGwSzoZbDj3PU0hLhccyPWsn7kX\/\/3MIcpqsr3p+XVRRzFRhJyW2ySSNuPAjSwBd6TT8EErC1JKHANteLWU3UzYi3CUq2NegFipkNLKrAQoJJCFe9ft7vVMPLYhiMoeDAKBA8spW6SfcQYhRWUCrEJRcyHJmQUj+ow+83j2Uf7bExRCe\/\/uQYOgAAsgUUusYwcxegnocYxk5i2BfS6y+iTFxiul1rGTmtlN2XWySSNuOw1tuZo8Qy3QEyF8WLRY75tEmEu0yxwI5bf0v6IB7uWLr51IaEus1m4rz6XGtjzH\/qFjL3z6BtI5U8fcLqpvaVhyhAtodznZ+6nepGqxbNdy\/5VklN22yNtpJuWc3lQxtg8EPDAygcxCgcdqXbc+rOwRsbNmVkvk5WsQTGJ9F84Z6d\/J\/KpjFblW3Wq02VPYDRs\/vJjnu6yTFtvsL0MCLkmd26zcqQ9vcIWab\/9un+pElJyWxtppJtLR\/UAOo9FiEMJZMUiDCSaUng6fQhizXKvq7YGv57lvRuIjpJzvv0wVgUUk9aki0at2LhdgwOg+QvPK1mnv1UpWTGmF9banp8ys8j8jScGnJ6+e6uzfFu\/F1AIWlbdtZZI2IQjCSvYUIDmr7REKTdxJWIax4KQd6rXfhAaKJFToAFLIJgd5wsAeOTnPNAUBWZ+2+UOf+9c7+Fa7Ysat1bNLpr0Pz8exwtfYq1i2MjEoVtpoSn2Lu\/\/lLkLds\/\/uQYO8AAwwU0ms5ecxawqpdZ1g5i6BZQ6xjJzGHiig1rGTmt1MIqSW2ONtJNRcyBVZgPkpeq1hrP4ZQ7iNVFNeYzWqN+Y3k2ZBGFT09ldvDDsbQSHmgyOFz1ajwrSj8u6\/u+fqnxr0vL+AOm4PX00jFIaZrWPQLL3PJqXQ0fNahZSPsXf9DkPQLq8kcre1ethFtySf\/1awhxw3qcbnrnTIDBMlT9DdHvwEh3\/p43GZasKoI6cVw5iosBuztJIb+NTW8rNTHLLvbvlnsFBr5M0wRNVQWJHDzYrZ60RVm7iqaV+1FmRWV1zwzrT4E3hZKihKiu8R\/tvtgMBTHDUApwkQcNaYYhc2SWjq1FKN2i8ColcMcgmQqAQ8uGNRmTT5YQbERl35yzJataV3aKnzwvgkDwWeCRGcRirqJSyLntxxIFoe4K91D+af7vEPuUsVAZab1utkjaQDK2mPexQwhMbFK0o4koYW1VEDBpvqIKbpZS5\/Iw\/YGNqEneWjAiS7mSbapbjuorGx683uDs0LHWgClIrE7rrpZqqXzFSKLNFbf\/\/uQYO+AAx0b0msYykxq41oNZzlJi+RdQYxnCTF+iqe9rGDk6ECUpJZ\/0rKNI2LaOOG0vAEoBmDQmclEMWYAbfCZr\/tTUcgAgOELYhBRoRng9uDTzudZFcls5Kpf2aocKlSpVw3yxnZzWSIuANxxCKBTroQdUQVXSp8aZYj7qNfR22e+g5bX\/SYoKG0TD\/7bW7OyqggWDSm1CgxIVezdWeDS9BKRGAps8q44AakIkTmBaCjYS3HXJDp1Hbcun893GZqh2rSKkMhK5jJbF4gu9VbzV6mK7LLCH\/lnR+dGle0VZoQ\/OZ91RCRIbPMP9rdbdUJRC0yCE4rigVCROW8akgur5MEhnUrdGUtJX2OmG6QJCv9AUFTbWRd6fpLkSopT\/K83eu2Oc3rlvPn3FVs91FgwnKEt9dzb76u\/18vaWTTJ44xqU2p3ij\/rMDNDJ4lvtt9bmeN\/Apy0mIkSxQB\/eNsaPrj1NaVzSwAztHklOw0AU6B4kQlVp+it1p6elpIUIwhJMKjYEQui0lXDekievQMtKk5My67\/3Udpn6b0\/enx\/\/uQYOcAApAU0WsaecxjYxncZzlJi+BbO+xl5yGKjOc9rOUkqBSScj\/6Vq5hitoGoslXOO3gZ9cqnwoaV0gIJA0ifKKR0t2MgQpZ039Hg9BGyZsZVKstot38cb1Pj2\/es42cViiw2MLgukrHa4CCiVL0evWvz22rbbmJ\/2f6d8h1EJChpDzP+21kEPIqF5jIR0Z1yEDQWLOwXZUDc6iJBKcMnnFdQHAhuQx5EdyWv3XYB9nFalEMZbAUrtQJ2pfvzdW5mwUKwQBJ4oogpsKGq0Mch0URIl5hLWtyW\/7No1uLtuirKiAgM0h5n7bW2VPdrrIjHEaOrCX5Y8\/kBp03JOApQiUS9fbLoiaEY8ghJfRmlwKglUWRS7HOrKI4HSgICNxECHhZBVrO5oCF4q62cdekq9SXh1aXQticwpzRk2EL\/66P\/bUAMhFSJniNtZZJSEKgyFwR40wYjToSjZcAgKrhyIZMBJwB3nSyDEN8J9aIURxOYa+DwKZW9jLZV3+Uk\/lh2zl3mNTQXBNjEzN6jQ\/Yvun3Naa1MoU9HmEFdLtF\/\/uQYOoAArsTzvsYYchcwxncZxhJjHxbN+1jByGEiOb9jGTcL+pS\/jmuq0z99qESWlJbG2kQUIgMWTLHwbztILJP2s9iBSaWUIpOH2DKuiTC1Fgbhx0aUpYFddno2J3mXQuSMip5qM02r2NXdbnd1QmRBJkjHaNHfFhXFHd6CtjX\/\/\/6Vre7FLru7rbZSVtskaaKTQCz40gHIA4jBk906X\/iUoSlvUqZtMkQ2SVvOtcOqnoXzYfRTMWML3alkkduS0\/M8bNBbocbFimtb7rHdbMFlvF3Nml0VXC54ghBqLKMgZaDNAr\/3U0rDgalJl1SECzXqRFEzSZif9tZaGvrxAB8+EUwoZ7QS7Jg77P+LjaDLAsJby+VVnRHgkrg6KdqqsHSaGB0EjkV3IIzP5Uk1fpaftS3Us43BgbGJcViMmoouhbGq3Jrt3p\/qnmpWNV1poWt9aWt1GkUtd9bbbJK6S0EHyd+jZEDSE6I5USGgd0jLgXC6+3Ig5JVIFoBYGOK9VgKC9Vqz1r+P8z7PAmYOEgqlJShVdlqKtFRqfW1PspU\/\/uQYOuAAyYYTXtPwkhcwvndaxhJjQhrPa3jCTGMi2b9rGTkf8rdyOnf8i52mL011VF1kGUEbbtJJIw400BFwKJKXY0OUeHGY1PT5TbQXlbwGOBZhI1\/J6AJUNaYOzqB41HyoCTjvfCJdjy9RfnUzv6EgYEpdDhW8kpET5rl7ozbvij0ttAn\/6P9L72vsRXWl3xSSIUZomJ+22FuMSY8dl7HRc4sPo2ERC5m6BsimMDCIlmMMMRgJn5CScLjqpVwNDO1MwPTL52LcilX6Wl\/H+73ZQCpMAlt1ToRmjZy6rkP\/7GWlXJt3ZBOXcjudU+qmx26OcSE1V4d9rrZICUQZ1EJBTtCiEEhKABwSzv6oCVxGguMnanAmZ135GjicISGInh1NS0SAfypbnN8xPWVujVn1l\/ik4RFBZh9wuhQAM1Hhr2Kn3Ndqve67c\/3KYdfexMlXZydZFR0IERZiJ+2+12RSEkIIDGJhtc4\/ytDSkCAkyISFbHvexLC2+RiQpY0uQU2aH5G5iUM2Yzhq\/nTCMVFAo8OXstZfLE5s0S2Idq3\/\/uQYOOAAtAUzWs5echewpmNaxk5DCBZOeznJyGQi2a9rTzkVGFij37N332S8q9o16loXF9f7\/qczE0aYift99tlUzJjFQjTLcYvsQ0LDT8YCgXMdcZnA7LZfATYV5KBMWgmBrd+XHEM1bVLaispwEGKFrVraVJDDd7nqTW5IvTVThBM+KKQiZUx7JU+5xaL1iu4J2jo0f+3rSrQRC2r9rJJGE2QAkpWg5ZjOPBqS7TSBdAYYPbWJFX3d2nt142AVHMLFYKlEETbIBr7N6sERiezp52rbCR0MFDwkCBxHU6YaHNTlKVFlrZW0QpKDomDX\/9vPU5z1+gBUzRHh3tttjk7BTxjlxvBjEBwjE5DvPUNbMugAylFOUk5LGFN2YHGcmsoU++3cGQzBpi8OyzOpfxx1hZv7B0TBQwmsc83pZrEr0qBZ8XV3XoBaL\/\/uUU0MZdW5xo4dtTnF\/2LQRRNsn8oAzpQYgGPIMsJCRyGqV77RBOOSz8ZsgUEHBoQLYVXORFOeLtVvRkkYcrO20q6\/FPQXoHtXqtJW1XvY6zrVLPr\/\/uQYOMAAuoSzvtYwbhjojnfZxk3C4RNL6zjByGQCmZ9nOTkCpQOF+LgDf77\/3837qEfXGZZCaKetlJpXWyNpEhEARmkNIMmEhHV2YeYOBJiS844CcGWAEE3hQKZ3cHQZkg5h4plCqhbiWnLR8PCQVqfCQOfE5RnMSyvEJVuvlYraCQmCAX2EFMTqHxp9jbPRXS5i+iugf\/\/\/iS0qu3Sl1zqYEmlLb\/0rKUAYZ\/w8NEpHELCFsnVbZ8W2kUqon6gqILWFBADQW8j7RonBReM5AtoNSM1J7l3tfPeP5Ya1f5KnXkTbYzfbW70\/zvR+5ff7k27df96k9\/TAk0pbf+lKATNCUpBKTapGEGpQumA+oWDHJKODh181VZQzFEYxoZUSpJRG6pUKAMQ6NHFu2\/7VEAgEyQi4wfW2TPprt\/69e23yDu\/9X\/+qnb\/pSCluS7bWSNpIDqBG0OFgApNePCzyVLRX\/MxCIzJUbXaXqvpeLEQfDX08Y04bcK44RB7tZ6g8Roo9XoJPzdzeuW2JPiiwghvuP+zrU9sNivyxGLevqZO\/\/uQYOEAAtQZzOM5wkxowunNZ1pJitRfO4znSTFKCSdxnGje6v33UQJyXbaSNogpnAwg\/hxFjQEOoyi\/5nBJSj9asbWjMgL+AwNgyTz+qJhWgziWZQwuWGC4Z9XoYLVgSHbePcqXO3Zzt2Mu6v493hzH7nirn1IKLOl139n\/uXv\/\/\/+iv\/3\/Qw1HdrpJG0SGkhBZpPcXejcu10EihWA8dbZPMs6SgC\/aA1hyj4JGiZxCl3qSDqcCGH6UpNlMD1Z69TY4U1LTVca+X7u95\/e87jcyTC4dcZRY88kdGICAfIPJraKqCr4HYpn\/\/0oNN227\/pWaoQCt8LxmaaggMaYJCWowk4EcVOwz0GuhwKeQrlFBgHquU+pt3KcKGT6jodaK1uVc5+9fhu6B3CAk8ZPj7es4rxj+uvehqWN8w\/rU516iWp9Mit4\/ofahfQxNIEEW3tdI2kCUewiBfghRb1eS9QSEhCCQFEaMSlvAcmJAqukGCEaCybjrLl8vg0lVHAVIkOwxmFUsjwjVmbodV70zkAXtgtRf0LKIsJOlmmxG93\/0\/\/uQYOkAAscV0Gs50cxfw4ntZzlJjIBzPaxrKTGHCmcxnGjmIauAekpRRocjub+nsVU1taAZMr1c1\/9bJKgUsZVE7nhpmsK4dRsRPMYPYxKzCl0vS0LgJZygQmTZTAhrFYalMmZmNqNBoYzbzq1MbV+9bzu5Z49\/m8bYapGrPLOewbYhHilsLryHyd6L2prnRnl1v9PM3vvoRUgsTO0xE7XWySw+Fyu6FqgPCRyirgIoKxCA1WF3SElsyaTyxRgyHU4lk4XDr2Jh5zs3OSxzG\/vPDuNrtxZLFWxM5yYSj6L1IMafIWN9tbbp6UlGuZt0JfmnOZct3vpQxDLfv7ZXEkyqACogUAGklgQExAVURtcbMi20pkJimk2+0Ilb\/s\/TLL0Gmro6EBtg61BBZ4usP4WK1xndYoWOir6Wyo662ZFVVpaWOHXhv5j+\/+5jetmlF7O+ij9yQEEzVVh4jba2SWKoJHEPsIZY+Ood1ChUqF790jSHyjMpdWZwPO2sN0Zfci7okc3+3WqV6vf1jWzB9BU8EDJwV31N3mRcrtv3jXpp\/\/uQYOgAAxkWTmn60cxmQzmvZ1lJC9BTNexnByF1iyX1rDzkfpup1ALpRYvurGZNtNitO6LmJoqpDRFt1kbjlyoQgTysE10pDI0C4BdJSgTIdzAkAanEX0ZxJ0\/27qtaVEn6pW6nMcs7DfN7z5y0fMAsCaA0Ra8H0FjL7ZUJt7hefA1TaFpatir9b0XfrsZa\/3dWjfv0MKCqvMxO1sjDDrigEqADuH1qorpKLWS5ZIPUOPDIBdl6IcCJjs3FRTk0R3iDZ3Jm0GAq6GnmtYWO5TGtYUtv+2SBqUPNu1SiVtpZbEAzq+keFl\/\/6dsx0EFAxRGiGi2xhJMuSpqhicsPo2L9BImPGCa5ghGmbJHBDh2dJNs4SSacMPh7pQpJO1LSEwd41uS171Wd1hqrnvC\/gFx4TE6gfe140ZOnKjv\/r9KH6XO0uuuaz21Jazepz7mNY1SWl9ZpFO7XSNpElPQ7aEw8YZorxtag\/KaTDpIcMAQ84sFgCgLrSU5jBQzITjm1AogKpLh9HRHq17tHt3uBOJirCXctCcvpFkY2pyva6v8Z\/\/uQYOOAAtsUTXsYwchgwmmfazg5CxRZMe1nByGYiuW9vODkfo9H\/bb1t3+pPUpGBo0zE7ayNiFUGGkAcDzoQVFIcCwCazsHMNA6nmh9Ixcosp+J6NBchGRA99XCl95KoBpYI\/cZyu3q32\/wu2Mb1zMJhYFXiVT22KxdUK0uvQL7E6FVPXyb1C9TKH\/\/5jXKRV\/fcwbAg3NbY20iCmthdTh2iZrRopPs+RtARnPYIOQYuDhjJVh3\/R2ODUky33bkNJgI8r36rc11B94liwsQORgwewym0nsLPA9KrLbHs7tVTv\/26NVXx0eXrpETBTNOBiiPUxH21kbC1zGULAJ4DCwKZZgZjTaZkVdmAW8MEN7RKNHlrjS0BBqzCQ7CnIEuhHndLJSPhtljz7CYmMOeKToq0PkbeI4oZr\/MMIYBQ9y3M\/\/9c19QoTFUiaiftrHHCGEJBIBwyNBtoxKdDETTbuPkp4iKeyNvPAjyqOHK6kJB0ezsKrBBYElGUszpb2H9r4FAgHCTWpx5J7ygTHrbSjX6aF+3WxSVj4YRRb92z26d\/\/uQYOSAArMUzutYecxmwtmPbxg5C0hNOaxh5zFdCeZ9nLzkv9tVARIsRLxrbImmBV5wB7YjLuwCAeQyFYW5I0xQ4lRYRp4LVKF3Ic+XsILsGnqsDLYrVpmRj6DLqaxyjxpLf573njupmkeuFA+yqwXFUz5TdBsYwevRcj0ixQ1LpWlt6u\/+rRqax3pkDNViqmftrZJTARCyj+GoQybgrMJSNPUftyyLgB4YNcrAnfSKamCbI0rkgeJzcGj2H+s5Xrk7fmRrHXC0SE4sNQ61CwOxTNdNCqtrNsi7Yoc\/1\/8eqvYlSGPTet2uEqWnJbdG2kSUQOzDAFUTFtgYBGQRh5icauWyGCSueGgrMpqsRuMAXGsEhZk0YprswVR5zyLPl5s2mZjdSpkbDCxoFKGgI8VG0KtWQHopIOQlRlK1uJROtNvcu\/rfvcpGzKsRr9mputZAQ3eJqZ\/+tklnpG0oQro5PolWRiKXjpJsGR9xwYkwZwqsZftxQDGRAC0aVPGyGSoKvfBfantaecRiAaYEA4cNbYxkUoYRvvaJtaqGID2K\/\/uQYOuAAuUUTPs5wchlotl\/azk5C9hJNezjBuGbiWc1rOjeG90Wwuc9ulz+\/drQttKX09DLUkutjbSJKZwODs4Pg0McQTjJjWCI3LRAUZ3KQahsxt\/WVvQCCBooYsEbxulJEUJgq6DZTFZjdjCfu4Xzp2k6KhRUDn5pOq1X+Te\/YqMOboz097F6F0S9j69+1EJPr6iAiU1aGeyRIop\/FqqrGteGLBpUmHokS1KotgKDjeIOdDMCZU0PPcZegDjMoltWjUVbx5sblWtmDJwKCE4NPmA+mZSBwEFv69Cuuj9Snn0qXehKXjxf1jftpsIf1mJCqNEvGtkbabtF5yqCBaZuLL0jnkf+MBvbLtAKE1Hm6u+piuM1qQXwrwNTJVBKY\/af6J\/2vu+BDBNgLuFRRV\/lgvIR6CX+YU1No6mhCL3JZI1d\/Tf7uvDn+sBRE2KFdmgbSJKR+MHBiUOOQAWNLnMkTTGQUDLBAiVM9yhJqJItDo7m5xJ81rWHyGMPdSrbRJf6rapMA8d8sFjKYvFGk6qLD600yyNr1xZrp6XU4Tbn\/\/uQYOYAAv8UTXs5echf4nnNZ1g5i4RFK+1jRuFpiWX9rGDcGv+rf7+6S7xN9cJVX3ukjSJKXw4o4FB7VMlMMAn1MCQEOFANeLN8e5FLFTVY5QqPjE0tuRrG+M4G8pHSkYXRY8knRpXnUCIOJax0AuYZMob17Pc5YvmXSHr3xO1U8jgWj6KN1zGvuoFGAyU3iXi21hpNDiQCo7AOsSSamOTCQT5qfhVKycZoQjVWaFF29UBBOjCWzTPZpuIdvWlM4ChtJMESsVAz2n3VGQE\/9P\/Y7WQhkcc3\/X3Kv6\/\/WsjR1VuKG7RNTX+1skqwSnLkLbReYeFF1xQDWwq6rDQ0AmRHdQ3ioAbuPNF4tPW2YG0jS49Er+GeuVcwoQBNTzN2Uhrs2fSul6a9vTqI3KmKdRJ2ZMJ029TS\/iltQHFUZVeWeyxtJAgAiowhEhSAvMUHmXGBCFpRCJIkrEy1R5IZf2NJTCqZ+yr5pN5bAmBdsK6BNf4rH9t5+aebB8BmWLYu\/3NWLve5ZVr99n6V\/fwGntaxNNX\/\/uKo7O8PFtsibcrB\/\/uQYOkAAvkQynt6ybheYvlNaw1JCsQ\/L+znJuFjCaa9jGDkxmVnEDc2ggkxPdCIKiOE3of0DjWFahQ1pFdSTY\/OU+dO3YO7KpqV4EzQSUeHvCdRINJIHFBhI9b0CjIyYPll1u693dDSXV2JTKOeidW5zkL\/\/v1slNK63\/uCWQxJE8yiHCABuoodp7N1FSphBUenmlxaBXbd+AlbzuFliQI7j\/1FlFMHKlL2my73+3wI0qUaAGi61l2IX9t5QmOjSz6Z9CtLf\/\/\/\/\/QmmzWyUk7ZP\/6qwXIBgs40F7koDWOknnCUbHvMvjZoC77DmQS2iqhx0+xQoTOJQuFQ5qXWV\/1Jh5IhNcG6DbKcZLZY8XJM7lejre39mlDv0f9aP6xFJJTS\/fFzvmEKGECm7yGGBKoGCjixZZiHpqK6EHuKs99Kth7UYCMciTeinJQMgy5MkguhvZCQqADZhj79bHjmED5Jb1PvRVcj\/+\/u76x+57yCbAJS9v7Fufp\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/yUyXa7G2\/\/uQYPEAAs8Xy3tZekheggl\/Yxg3CthPI43rJwFCiuRxrCDg00k8b1luzYyww0DQSGFzBigBteLSqaGgvU2aRyFmkHrZDBFfS211OJijGVTVcfG1F4mEAqHXwqskxDLTC0jTh3C\/7Uv2TjUXr\/3\/f9Ovu1bYviuJNl33jbSJKQmggM2E8SsrBNYUfd8eQwWNNq+hYwshlcmc+FLWEwYflc7TURICEpw1Oz2IsZek8PED27C7SO3ra1FJXFWCRi9KOi9MimVp6n7OizuRtufU\/Wikq277RtoEkREqlElikJGn4HIA8xXu84KTUvmwDuUCyxtYxaJQsOWpKKs\/ZmChcntIC41gSQu+E9fS22pAr\/6I299BVgR0O7uQZvUhvlhRM2Vnh4skbSTYQgFY0Po37SfSXYi0UZQjA7EwBWqhzhmOtHZ4BzL6a9ztOuQDyk8siOHbeljySb6heLqYKNO+icd26rk4lcWssjb2WWfZqppa+qkVF87X5D\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/QDNWZoZ5JEyilOxs7hBk2BImGcZ\/\/uQYP+AA+IQyONY0bBYomkdby84C0RBKa1jJuE3B6U1rODcPWRFtzxASah0asQH3cJO\/jSTgfXzDEqp7qyAwx+45WugVQGBVwblFoDYiNqa1bq\/sF0wqshsbR9bsUPFEoQuz8Z69peX\/1OCEyrEM8sjaSaWgwNaOopSxgxIC1BczLS5T7xRVsZYi4jqyFyy2BFAwLLA0AMgeJfMG1sxykCA0QQhQXn3KOHumoBdRm63bZu7unu\/n2P0uMJZ20vo9EAqQzxDztbI25LlTNlaIgTY8I56rQsQGPORn+eoyydCG5+7Bq8llW5blnx9weF9LFJnfvgyJBKLFQm5KCwsp\/Qw2K7YHcwoK3+9otU0zr3WVxg3zNNC0b6\/1WFKbEAgkmOJyqgqRcsMAWNLfbMuEEEQEPk6qwQmAVzAHCKl6JREtq8EDEQb9P4DmCB28BcLg+GWuhOiwupdrmoyrttS7Vq\/\/\/\/csxZppwN\/HK\/QQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/2W27LL\/fHN6DjYgC\/\/uQYP+AA24Ry3tYwbha4glfYzk3CtBPLezhpyF2CKY9rGDcARKxRS82l8eJoUhYg5jVWtNKr6XOF+ltUogEwyZsRfFnokd+6K5yHlpPg6UIlHztXqWJCChQ2cdXHte5vTR\/\/77LXPQRehT3\/cbpZJZksn\/10KE3yix27xQWlJijynMNP5IqzWwbVmr\/Ut6ROmUGfmrUrcbG+d\/Ddf7nBK4Ngu2NBco1whmgPhJhCVsjKd2ytmatZYnkHGrm+jt\/bKbf2JQJackndVUvKSA4Ua8dCh0EYyMLI2nDKgFelh1YkmdOJO\/NvaVR7ilJhm+jKoVbHCYRT60gAsHlmjrdjEp0pY9u2OSXatRulFL9SFo9rmxZaLXe91\/Ve5e21KwmmSOu\/3dlloqyTpBS5gIDGHFDRjyBoQ5rFERMal3fyxsAlGBaX96pUR6anm0A0IiRB6DKVkV6\/ChkVF6qevXdkn2Cq9Ht7U0n3XgVzrKv\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+AA7IPR2NYebBWwgkcazg2CrBHI41jBsFpB6QxrGDY9nLa3W36guAQMQdSZMYGeUgiF+C\/RUPPeh5Zt2oel8AafokA+LNYi0gNxiRgctni5QWKITtcXuUn6MrtR\/rfu+76l1rED1dLxWx2yha9bLDklk6qqm6BUmFwJ3SYCpBQSDT5MpehbJiwrDJggy4numJA9BIINm57Q8ZH52C3Vbs71uuo3IF0KaJeMeq9UWrtPpV3tqWipF1Nauaq3X7133T1LGOT0176UwoSSV3\/+sFAhAcTED6mTQEJxMYjWzsFoR52hEBJJFhQw\/DphFwL730T8RnMZ5mtPv6zGy4VqcEyQ5oYZLpQ9bpVZGgWpT\/\/+p3JwrS9L0DzykhlqSOOVTTL7qWiEGdaknJBxlP6TpmIkIdVuFChIqBOGZPYfyRkuGlV+bvPEJBna9vcToEow2WTYVKPB1j2Ov9KvSKH11JStxtVugu\/+TbRVuFbey\/V6f\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/4YpLK51RV\/\/uQYP+ABBQPyONYwbBN4dk8ay83C1BNIY1h5wFHCmRxnLzgIrDAcGhgl2NFk5AtBKHjZFwIS5DDotePzL\/QDL1tC0EauVbd5qqeb\/0OInFwkBWvszxK+9429gofo\/\/SSd0etSxpVBAFYBtbWyixunvZTs2qwk1s0scbbbYWAOCdYgVpQljowPEDUyhUFDCX3Bhoh0vzG\/V44AUW1zOxdrsB2icNXy\/czr598MjpYuCTz7XYyHOjZXcW43XTpS3IfQ55GiilCfYNjWLfrHYSW263\/YRRlNZduxESr+HyxKTeFLDFyL5CCJXCkfTRV4g5UFSGNY2KViQGPiQWJogMLOaLPYMMzsNaPpebOEFWf9rDN5RmafVQpvf\/rtf3+mtiG6uOVVVRfZCgYHMn4a7CgC9ggZfRYEO5ZL7IwQR5Cg5lAig03kZ3eTQXDqAPdvONvGr91qH6d5hToVlHXjrX\/ts0RN9NrTCcW3ragslYuqozjcV\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+AA9wQR+NYwbBXgfkMaxg2CxRnJazhaQFFhyTxl+Dc\/\/\/\/\/\/\/\/\/\/\/\/2ItrK5\/91MyV00oB6MZVOBH0iohIGQzseXRFBCRjVi9i1EhAWPd\/V6VvvhjRcE5pqyV7XpWeyaE6Dwjpt\/vkF2qU6z7fsb\/O\/Y7yn+nCK3XSxtttttQMkaAD4DB2CkhlKHS7q3jY9oruijU8YnUt+uwNK\/1Hawzetfdqnyq63h9litqC8PrjqntKVdUe19XXZ8WTS9T+0pGfYhupXuirW1vr1cybe66RtIEhSlAM4JigyvoBLF8oIK4ZgKhSQWqFczdLhcTE9CmE8cMsfAVsrGc+wmB8UBcBHrUW2IWxzXuhl2\/QbO\/\/u3devUyOSyUEzqDGTOzW1SgJYDA0iFwRvQ7LrArMGgIROISGepk5W\/jGHIW2IFeZvGq1ivYQO5ar3N9w8XSLJUjXTcxvmdK51GVvulytC279WPf+VozdI1Lusvf0\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABFoPSGM5ebBMwgkcYzg2CrxLJazjBsE7iGU1rEjc\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/jr9tr420iSpck87Q4NLXIIDLLzggwcQzkXKVthgFCKbyinnNylQOkne74m0cAzu2w4FnnsYX6kFRdIvFlNFutVtFKvatUUFe496rd\/sd9bEdaXR17aU0NV2Vz67ufNgy707lcDAQFsCGAizGBjIRYSIN5bgvSaNgLo707KI4ZA0SU6djwNjHGdrfQ8mV4iV32P70Cyq7bX\/73atDRY\/62o1W\/SiBFqyOVKqshTMihp2CiaVQWmBBZmsvHwXVa8YrUudeLSGH3xMBIjMY35xpYgTTdvtEKyaZwVKqr7L9rfyK9exrtXo\/R9n7vt1HVM+mGva2y\/\/56s8ZU7LogQCsMYuuLDS2gTIPg6IY0k6nE9Fft4PJD9wtYXRkzbOoe43l2PcPQcDZaydvHH5FCbEoq82Zp\/\/4ky+hDhRyUO\/p1RVh4r\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABGkQSWNYwbhWgelNazk3CbRJI4y+BsEvB+PxrODY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/sNSxxSqhRboCAMFG+QkwAuQaO0Y4YgAiRm2jw7pAGBL0rykr7FgMjy7v39DTRbGrdzIokYWFgPiqwUNb3vTcaAv\/\/bfTsu\/f\/\/tR\/p1pZJaiaf+wCVQ6Q4tlLpJxAD2GJwVBaNhwqwBvOmJB0zQhEXONb6YyaRIx0u4hfHbSanLLqNu1IbV9enclfZYY7af\/\/7FoRVel9FBNMjdb4w+zTREIOHIizDTN7TFBclDzm6OV5fTSGxWViSAnkMnpji6AXHVY1hdCEChGW7E3\/+Qc17DgFdoQBVzSl7dTOm7f0p+r+q1mkkmSNpzFMtJt+BOcWLeMgPKVygjtJLuY7SPj2xK19ysHUfZFpfO6fFI+hXmXL\/3pUuRehbUbBz\/9Ll5tq9NTmfnf6U9CkV\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABMUPSWNPebBN4hj8axg2CWw9HW095sEsiCNhrDzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+iDHG0+9h8RiDBhDVLWQKGmKiiTt5EbYZeGYCiFXSmtQrpJAPc8fX6eCMvSrA21iMbr\/oKoLt1fe+p\/7KO1\/7P\/9JbX8tqraSkbaf\/qdCw8wZU6D6la0ZasJZiYKc5vGruMF09xGdpoDwOhbea1pJnRFsLCJpdiJixhRTTmqldzNzru\/doXjVxd3R\/W\/Sjv911WjbyTLLbUSlVVU\/RIGz0pFFu0EgwCDjx6l2AVSWxwRo5PBfxx4hWkKt9vaxeq1smdBlFymKmuL1u1oQ1bk69jXtjNyr80jv2VsSn81c\/8\/XR00CKFyNp0qqqVaKokROgJQmigQR0nanCoFULfxoxNY\/aprDx8L5ivfF5gi48fG8wtGBI9BncPcizVqe7oRRcjqC51G+K3tave1KbGFK\/OxjbvWiK1U\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABMkQR+M4YbBGodjraw82CbQ9HW1h5sE9B6Oxp+DY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/Gy5G0pVVVVUUAzBxU5gOfWDgCMKmZS9w1N9XhC82V2K0qcFSGKqI8vkuiYntSLmepxLkLMpF0cvU1THVd3FNQoS\/u\/pTu4qquKbEoozdLuTimuJpxppyqqqwo4EBgQNhkodJYKxgdEi0+WcUn0qoaFT4dkPQnij3HvU\/AvNB0JiETC703tvWp4dzPe0lXY61z8VQr02i6VXbsC9V7f1f+5N96mkXI2VMqKKHxsRIi+cmWOFT3saXBxwFD8iDiL\/sVZWsiAkQn\/QNE4wRBEfcsXNAFRFa3WNw6m3r1oLf\/9AFvf\/t7K0iGNRptyqqrzpVJumAekc2xwrkekKoJImzWJO5w9OHHepaSWUleWRsWToHhABCyTLY1oupbBtDG10O7FXo6drNaPac\/L6yiEetSH39Kvr0Fv\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABLERx2NYebBSYkjsbw82Chg7HY1h5sENhyOxnCzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/dvtvghEQUAFyLXHnU1T35HiEcXxLLOBnZ3VPhqXmYu9txDIZwakcIrbBiH2C5dtbcNmX8Z\/\/rd\/\/\/e7\/u\/VZRDZbXHP\/vJ+aJKVAULKISwLuLa1kXhqNy4oDB\/MO3gluiRdfZViBngCHwwsQB9CgABiKiptzbWiiSiWM9TentYg+QS5D1zoaF\/\/\/+378hylLcscTqqqnSITF3Au+MUamxQGc7mCqGe5h+uOKP5rgUQ7764jXnnaHOue9alalD171Jq2pY1ivimqKdtGWVH\/uis6m2lmqjmiGaSJtzTKsNJCrJMQLNMCVyY\/uY0ShAZw6lS4A7Dmzrf2d7purePFFKnA0ADL8qfSNNWl1OTt7mqKtdU1+\/dJcn\/6uur2Jpts9Dif\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABS4Ox2MvwbA\/4djYaw82Ceg5I4zh5sEfh2Qxl6TY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/8LrjTT\/Z\/AsGQSmiSGBCq7MhaJiEKtg+MMWmqQPjVvLqDQQ\/pWq0Jre\/8Vgi69z07\/etm9SlXLd\/\/Wxc1TWN6f16GZXWkVKiqRBo1MAp6M72A6aJj20jp3asPMuPFcvqlgcJ980V8SwPlCaVOaoVW+quOf\/2WbnNldXHe5lfqtR2vj4vDK400pVVVfSNQ6SHCI6IUtBa8DbGJcAHRSR2Q9o0ssJ+G2qN33q6lzm0MULLW0ojV1XNGlDrbNOG270Nuu3N6uKbfvoY0ijqRRvjlIRRk0BtORppSqqs2\/4GaOhxnMkETiDw8gvKG4mK60aPVS7nAWUuZvQFiKjQKBj1V4ym66+wwgz8l6lXoTeIaKvpKP\/ZkxSthwBUbmfFU75v\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABUsOx+NPebBB4gjraww2CDQ\/HY1gxsE\/CCOxp7zY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+NxuJpfvRAYCMFAwNBFA2qAwG5DiiGF4MPjj+DplmfrG8QfDJJfUWxelMUhmqoVY+o9Qyxc93N46r\/5qz243VXSfl+VRs2v+2huRtppMqquLqIGAl6nIvow+gIOIatKcxdgdI0WBcupDyJ\/r3hFtAmmKiNKghqYvhposf7Ev2qm0ySETbZj9K35o3Z6EPz9KBK3KP2aUV3qklciaUqqrEgwIEACawzI4BAOYFSgqrUYVmEnwy2oha5NS1hSIMll3qmoBq0+pwYFDgvPtHMQ3PKkmIf2VXpdFK3lyGxb1769ScUxi9WjvZynarknHUhqJxpp\/\/DcbSOOzhEEvQAUBKhcs4EszTDqPCfV7uzSRms0qwjHiRYVblurlViyrzj1qStAut79jM9bbfGX\/etw76mx3069XwJRXtFv\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABHoPR2M4YbBIwcjrbw82CeA7HY09hsFWiCOxvDzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/4o5G0V\/zYxYgicYiCFgSCI1FQrWkELqAI4zIPFnev4TuZ1+4C58a5g18g8DdjG+XNjNc7mcCitiCriPZeY9\/6Kk9UIRQttMv13hMIFHBxg4JELbUKiULU2VYnmVKJyrfS1HAEU2\/nAwaCjHCq1qPnkz601MR\/36bX\/\/u2dHxf0aX7vIMXtbfUjC2yiucoISQhTTmC5ZgAAFkJWE3JGnEKmC1EmvCwdeI1\/zNOBqqRJLGlUDRVoSAFX9\/2ykDxbVZjR9wlWbrTes8oUu\/\/1t27f0hmJtlpe+9dR\/zLiAwSyQpOwegHQlP6nIRz\/PSFhtLZhxFCDS7OzisXf\/9CJPt1I67vW1WxVWyIO2j2zO5NOJNZf\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABVwPx1svebBDYcjraeg2CIA7HW09ZsEnB2Ntp7DY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/ZijSaX\/yiC0JoKkBxKf5lji4pMyxlsdxsOvAvhTuTbjNYGx06Q5wCJNSpKdaWCqVE\/rLS5RrBASLVos\/b299NiW9tnamu7yO7N3QyxxuqqqqiIcAPnNix2A21ULUKZHCTeAIIt1pJFsAKr7TtQme\/spWSWm9jVPsXFIQSTG1r84cxph8f7Xv72UESa9S72i+5CLznfTFq5YJGUXMqitaQQiB2aaqy4VElhO10OJThIC\/QyV1+tUlVFJ\/9JMX8ePiGdeNsrIhEUEIUUl6R6ca1UfbxewXQltSqP\/9aHa3rnm2XXWHkS2jKUBuJtpJf\/pIARFOQBgUOGHQ84zcDxHcto6u0gqjfb\/BYSaXgw1YYyJHWpBHfrNJRfa\/Rq6b5jIW7qaGrtvkM2NvfVv0uz5jo\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABKAOR1ssWbBJodjrZe82Caw\/IYy9JsFGiCOxp7zY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/7+mySWs6JSJkZSnCnYYtDn5LC4EhZXMSVpdRJ17ylyerc4D5\/jR1rjAgc+5nztLKFre7tVr\/tr7qCcOpn3u1\/b3f60dVSabpI23VVVUAsLm4dLoNzHMwkagoSjT7sIQqr3g0iRD1b4TBhg5TUx08AWz8wJkDd6ZBqaJpOKOrd7Gahy+Rr1D700Z5aHaVoc3QNuNVNSuNIv\/4+56QBtk6SBd4hwBJJYXhiHezBSMz6bF6Ty+3oOAQ+DN6bKGuoRzl8A102C2wxPJRoq+xPjFBrJaPU5DO6mL\/NTIspRp1tpJ\/\/lBUPCAi7b5GDkFsHzaVy6oPOmsQoLPUpeaCeBezjgHIijW7EeHngupfa3chX+5Xtpy7HWNqN32oGmHvS2d9dHv1f\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABQIOx1sMSbBGgejYaew2CaQ7IY09ZsEkCCOtp6TY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/FK3EkpSVRsYGEt2B2JONuAV7AEAlUgP12zgwzh9pGZoXRUseEQ4oBiYdIMqRR\/JDDo8EBKLFsY+1bvTVpFtP2XAcUTDtHa9UsibSSlVVIgqYRePgFcNxL4i6Ntxeo\/DUwsw8oG5HzOmiE6tEowAgUs11VBxJFpNSX5Dc0ACqEehECNNt6LeRd12Td1PS444yiv\/emEA2q43uiIF8PZisDiT3+mWI0fP4iC9q4rCcGLKlDnuPOpNtHWOZz7GDpRdyL27NSfNIsqRS2puaz71916b76D1TbUiOVppJf6zBEEtEY+rWUTzLTMQFnQ\/C3gMbEuc2qS7OeWsDLJRxUYeuf3uCJt6UtbXMsdorq7Wr2Rd+s\/Wh5TFf\/+rsi6d3o\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABS8PR1tPYbBHwcjsaes2CKg7HYw9psEnByOtjBzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/23W2kVv+b+1ToEoCl5UMmwEtihF03IcUbVtZaKnb+AaSuMJuQb+aa7cLQtqNdKK0qk\/1a2B3ptQse+fS77WNzUm1v0NSNtNL\/ofhmZEdmdM5LG3CjTouVaru3IEazwwFASU2KAuD0mNRee0OQuqt2q0sxOt33Wqt\/XQW0LuoG9HYpJxFFE31ekLQzvHUdZWhqTMOGb2AAWszyWAEV+Mwky9YUCXoIrJqgM3Yg61sigwH0ROQc4KFmh5i3ZgR29fX7lORuuZWyvrr\/QiJxNJpSqqroiALGDxGo5IBQB2UQYntDiXQ2UgkeIggIgcAp2cSsrQzYXuNkdB16d5tXHG6V1NPss\/Sy\/b6ke2x3j\/TdGlwgj\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABZIOx1svSbBDYdjraeY2B7wvHWxhBMEmByNtlKTY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/akTSRTKqo2R0HbOnGus2SfDC9CDSFMJa2v5TTjdPjAtaV\/fLobgIw9n8NezTFC3QjEvLXJTfS677PG6uhtxNFE\/Q9CiyNxlU3qg4IIEG0pgPr6s8HNfUgsuI+jGRQUakTilCWBU+IH1PcYC63Db\/sqBphh6nEYk6NXd+OK\/T7X26vSlyVxlJf++8EojgmOwRhJiTqYGVKOIyKDdWs\/GMRpt2gIKFrJ61YC0KxxJD22sk7Gv3\/octGzvFiXVRGWUI07m9cUf1ojdJyRNpFSqqtG3IZBB\/riMjQ+Gh6sjKNsvN2rxxUBn2wVIfWJw2sWx9e9fQirZFa33HWU9HSrvo1MmvULtacZIWl2bkJLpTo6P\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABaILR2MMWSA8gpjsYSg4CNA7G2w9BsEWh2Otp6DY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/clbZRTKqrHZYh+YoyX70mhO0tkP0ydbGxGzvwgbfmT64ycfFTQNoPnUTwo1sc1+zvuxZl1wA06H0YDtSlK7WUITXDuhP96BvsYYlnXG0kj\/2L2GMFi7aLzhARwLcpZxXoD82NWkMrPvBVlzF2qNCuwd6FtCM8jXe9+2it7xRz188ubjqNX+jRK6mUkpVRFsaWimJ7IsXpTISGgsOIxd\/dIt9+S2OS34DT6BoDnDj0vpDi99QfbWcljj3mGaNX\/+\/mWf\/\/TqlFPqZiuv\/qZfsgtZ8QO8EYZDxeJKFzapGeATD3+otBpqO5KJvCYfWq6HXgyPg0LmQMtEpftDdt9mgTOn7K9yjYgF6bKHs+xfpM\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABZAOR2MsKbBLQcjsZek2B4wrHW1hJIENh6Oxl6TY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+1I2kkv\/gl3o4MhmKtcC0QMIDsKjpdz3O7e2L9ROFDJTGKYayjhnF3xtpvObXUOW2owr6b7bX9d53i7nmbdH2P8MoupU2420iv\/lDTUJBwVbT4JUVKDDQLsDxkJnoTmpQOOXigkcOWKb7lJp529+L7qyVIrfjTLUqED71kovdbYjq6tX0Wpdq6qWVXGUV\/dWVSwUDjfmXUG6BaGQAYFiFGJ3o8p6mvCuDDbEoTseq6NqteOclV8rfru+g\/\/\/9KaobFfsf1DOmhtxRpFf\/E4IckyuJucHH2AuPE3VWTRtaloLC6b9iiDkQALYsjfY1AhdRXq9ThmT2Luq0TiVq2Rfs7HatoppUz+h20HP\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABbMOxsNPSbBEQdjraYY2CJQ5HW0k5sD3B2OtlSDY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/2nU0kV\/8ccO2YsNWekxOkOyqUOCOQY1vThJk\/ephulPv0vNuF3MXe6nT1XNdiVv301kfxtjtTk9u+67S895oevxZRxNJFSqqMzshLG2kxTADACYPiAAM4ERmxkABqWMGGAOREwKFvXu7BCh7NKdqrD7Mc\/JfTQZnPV\/\/p2Kz1rDVvLNyJNIqVVVn4GZGLakQCuTAxVXURuwqQmi+9MDu9IgATDj4eEiCxJJ\/Qlcf9DPXJ1bUVP67GMq\/3pbQkWc76jy0fFyORppJf\/BCDS2jumFzs4C5BxEy5FTAVtl\/kwcqZ9nkQmJ72zpaPe2eqWRdOmFiNR9xn1H\/zTVH50fu9KLeiSo0IbZmIva7Gr1\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABcIOx1svMbBBgdjraMk2CBw5HY0MpsEIh2OxlhTY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+0omykv+vLDsiK54VCYhFJ5ONVdxzDrv+lEBphoYEQUPEFvotYYDHF90g2dRY8mvc4uihBezHqPpcxDO5K+rRpUrI0iimVVWtcj4LLUIXICoAnyFGVFCGx8hAhSNck+RsjlyJQ8B3pQgvKk6oNXxFS\/UinVo13reXTmXvbqbxiE+2tQfOPxikb6VHEkUTrFa\/DZ3gizYoFQyl4KBAsHgBP32EO1U+i0CzRHdKudfTHp22q2qCwonIXagRafC7rHPp\/\/\/\/\/7O5R1xtlFf\/7yL2PaFtPGQoYSSEAVxgLpVPDYvZewacE6WNz99Q1bX0PvShKtV\/TRyF\/\/XpR063t9LjL51\/vt3q\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABbMOR1tMMbBAgcjrYeg2CQw\/HY2ZBsD2hyNtowzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+VRRIpd+3RdQMCHPQ6pGVo4H1AXyfOF5jM93LSPaADg0LqWteIWLM\/0HpVMm9dGixCUNFnc8\/7ifdctW2u62vT96OXrddSRSX\/25St0+MIzShkoZOIDAzIYflXACrvUENclbITqUlK2tcPttr9fTqUOf7v2K9CWjy3Uskr6We7r+JHZEkkVKqKx5uKHoMuYiykRqt3ovpcARkPZJ8xcVYS\/dvePFQE5jlE0plSKlPGi9ta9yxtVH\/qdsa6lNFaVE8Z16NaHFe65DKUhx1NFIsqqky8TOBj9h7BSENFr8oo6bK3lV7gZw5MOizDz5wySXS5CH0M+tluvda5DFflkrYzW3\/W6l6lkq\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABZQOR1tJObBDwcjragM2B7g5HWyMZsEiiSOxkyDY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/3W20kV98viBaMAvfSVtQXGATRpPnRqjSREYRH2D1k7wIww2woVQiNctRTXq\/\/U29jL\/9zH7gym51\/dcz7PVU46mkkv7us2koV1TwcacBGGzgJFrjc8lbOdmO8DrLKErXmL3ZNdFT7qlpvMNfaBWeUqiGn\/\/zXFMb62XOVV6HHC2Ul\/76yNbAGpYiQWov\/OCL2wXQ++xASIhmCHcLj564iILTLXpsNf3H2MZp2PLL7qOPbZtu2uI0qVzc8v+6ryBx1tJJSqqMy\/D4kLYnAIhpDOZVEIaw\/O+Y1QxZGPRYEB4CFDaxz3oWmftbOsjNaGGZ+6qyUfR6bMC0jytX\/\/9n4pT\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABfILx2MaETA+ocjrYMc2B9Q7HWwkxsEFhyOthIzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/upppJL\/q7xobGu\/0y5rz1hduIkf7jbOTLOwQEgxhQ0Iepbw3XuADO7fuyKKqd9Jty+p\/RbQzt6UKOppIp97txkQoSVTJhYoa\/MReNqNw2JwhnUFSJ\/gNQVQQ6W7tBjJWI1rtZ\/6qLukrcRCN7NFwv9t+nq61HEkkV99W4rcWSh6Dxwa1iy6T4qdZBnBm\/14NAVjCwXN0rxRD3dS7jH\/9Vdb9e2ttuhRPdMXObpZkl\/ZzENBxxJIpf\/HHeTAAnJM+AhI0nmyKBtRi0gdAPpOHs+4BtsYZYh5JGldT\/1xQLvNV+lSaSrN0WoqFdFqKPWt\/p2U9P\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABlEMx2MZGTA4QcjrYYY2B4QtHWxkZID4hyOtgxjY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/fTV+748icD7UYjDpgZuHGXTNkD7ECoLB0EWOi4fSs\/DPexjLmLVRFHmbdX\/171mb5L7NhZyl\/1+JRdDepxtJFEyqisoi7rAlESzFpHxpy0CUm+tSIs5RWaaBxW9F7nCXfnnyDGGsXcspLf\/0Pd9u9+lIrn7UL3YtHfdknG00kT98VPj6CDqyEHBb\/hZdp0maARlQ1K7Gqy+eLKF72C\/xj\/\/tbStu96zX0rL9Ny9dSD4pTpvCNyhxxIlFf9QsZngnUYqCBGmJuG7vqmLRcwkWWYU+yLMtSAUqFNYqZ7tL1NtoI0rSy6y+kj5Z1tj6v0f\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABjMJR1nyKSA9IajoMSMmB9grHYwwxIDqA6Os9jBQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+qmmkif\/zuMdOhCzoA5LiwnjEPbbtPAWsQUMWOpA2t8rA\/q2MZvF0Mxls81VVWjcqdQ9lLIh8\/\/WO3nabNbTDkaSSK\/42HFEAiiXl3M9pFsJKB3VNjZudBqNZS+QuGejOvVw8otTJg617sjbptvxiOW+y7JSa9DqjaKS\/+Muyvo99qYDKWXgxgCJNSvPKBDB01BIHhauQw9ZnMmy7r32Oak7+RtRXePr1dT6\/93T3XcL9ChxxpIlf+\/LcMAGwrrlxIe2Qp5oBCpY1zwookDT5vHDVQApOKo\/W2iXi13RehH+\/N3ELNDeyLYsuzX0sqqp\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABlUOR1nlEbA+wSjrZSkkBvA5HWeMZsDvhyOtgwzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/ccSSSX\/wFDmQ5iDpgtyk0OdlsC1qhkUMzkmYg4GJYpGyi0klvpcEHsAl99tVjBLMPHWtV7aNnHWzfYuv2X22976i6mINONpIIr\/4hC4YNoXPpCuMqNdZw03KYVZFxwnF61VoboolUKY6KUW2K63tbrye1qX0VfX3NWzz6qfevbrUcTSRP\/ybIUD429niEjZ8YAkHjKA28ZtMXMQqaTc9cdazm0J1K6PUce5KUqpYPtXHbZBbPZ8j3fvSKVh1tNJFf\/aamh6bbW5iwbvtEV0gkVENKGklhQCBlVFT0XMWrTdc\/6a9cXcMVOt2M3I0cw7T37Daqvs+w5mv\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABggJR1nvMSBFIgjrYQM2B2QrHWwwpIDtguOtLCRI\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/9RMEkk8BuGH9DbzxQligKAUe8EAbCABEIq+XPiBZwfYPcn\/TsfZt\/\/\/\/1\/u+F2dl2X1a3E0kUl+826MUA3ezzPOswfiLnU2NUf4fBvqPEVGYdag5VLikYjb7kH9\/\/\/tu19HbftY70tmf49RtNIlSqqlSgkoahzs3PnbWExSsg3c7k3lYWVHhcED06U6UXgdr+AbqHjuml7EL2IVr9CNGhpRzlOSlJxxFFJf\/UjziC2rc+BlCspJ591ZukeIGFi7gulQ4PPzzvXU1so5krrtzSs7FVEq7G+Bm2aVR996bdKIcqeh9D9qnK\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABsAKx1sMESAywJjbYeASBuA7HWwMxsDshyOxhIjY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/9NQpEk9ReLMCbg+dJKqTy8HlACMHgUPuaEDR+VMtFAu5mBXqd70vYYFL1dqrjkkd23dav39T3df1+j+nU4mkkkf3uOGsCGIouwG9oTECIJibOpMRTHOtqhphAvW3chVzXleq9EkjR\/+1H2XoHlEetKVa7RK+Q30O9TbiSQJZVVI\/DMONimadHkeO7C9yD8SRf\/v1Zp9czBhAPY9ECrcsxr+WsSbBSyxurrfyS5vTahfpFGSHEBxNJIlMqisJkNEC\/V2QN6sDT00uc1m0sWQQ8IqaoQjjdjUcU9Gj0q7if\/3q3u0HHPe3QkOJ9etDNeopur\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABkIMR1sNGTA8IOjbPwYUB5A7HWwEZsDwCmOxhAjg\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/9xxJFFf+0eJP+AnxbIRKSCFXC3QIzYZQvqg0mYQSaypDmqo3s5921bEKrcwX6YytWm2QklJreope\/r9++ej42+2v\/amv\/QNSAwGxKMmvQiiwkAY5aQgEBUSIQXe18mvNnFuY11TO1fWu6yezN6ewc5dH1V1aq6bv37V16FE0kSToUpnnkAzJdgGdGg1jQuITaPnJAS4FlMVEZgy\/XYLLRnN\/qe7r\/\/7NXYhlaWqbATBFdWri2z6CRNJJJf4XYgpcRV+IejxQwQsCEaTYELfikJGxRJzKtagAuualtY90+H6qPpKGfb1J2rs96\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABjYOR2HmEbBBQdjrYKI2B0gfHQSkYoDqBWNth5iQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/7tqq\/9D9BAvLgK2YWLHjEKFhKfAZ8BFAgyxLN15YZsYrWggu21\/ue3ptdW5H0PCyKtVO19yn6W\/Vtr+qlWcKhpK0njq8Z6GMJ0eRjW1mZ2pBoCk20If61bbawuLKyypIXS1iv6OZX1FeyxKor+yv3b9b6lJuJIpH+4cjIKchDMMEl\/gVuQl4R3GBUKh8u2LlCq\/eSYiOBNlrUxG+3IGhZ69PrEtX\/\/Xp\/pdTevZixRJpJIP\/3q6Am8vUER4AmOBL07JLT1oNt+m7MDXkz1qlqB9xK9qvpUtLqb90jqWpdlY7GRR6U2e+pO\/22V0f\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABnYPR1njGbA6QQjoMaMkByQ5GweYRsDrBWOs94yQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+4okiifvqq0AF7FsTgeULFbXKXfvQ7XLQmskKKQ4Zd0+xD2\/\/qUz+ztUoXIVE\/WL1ydzK6N23OhxFUtbKqvYLuKh4Z3wCjHpX573fsYHDBaRNijAzcYYgW\/rc1bnpFcZO1AH3aqIxvTv\/rd+tKO13S29tKibaSJ\/\/sg3QMzfUbFlTHVcNAhiACCZlyoi0k6BRImQ2phdQ6+y7tXrQ7PuILZtC3p10M111Hftov9++6hK7VVfipHkDUrEMRd+CLlU4g4zJDlu4ggwXiN67jJFYbPMGsnjLxNRd9aGf\/9PjdG+SySbJg3\/\/TT\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABmcLR1nmMSA6gWjrPeYkBwAxGweYZMD2BCOs94yQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/3Sqr8GEtlY00lsRMk4KAIE6DoRWFCNqbDrTtd4o+Bwi8XAZK4v+jVLr6Neyz21brO+u5V+m\/TV\/9Evf5ULweTZBQlLCYFE7iCeodqWqCUuVPGkIWlDP9xlFXI9aKHrlJ24Iq\/qcv6Hs7nPoYjV6fUo0mSkfvhTBnCPqmBjkUAizPySh1BEohSC10QJ1rkZzT01f+hvtM00V19Kt9jftv\/uX\/Dz7ZZeqhkKIyLTBjiQI\/Er+PX56aIERxtrmBQIocA0ngGbWtn+UfAT6P4QsEIom9Ja9Nn+6hOdj9Ltak36dgz\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABs8ORsHjEbA3QMjYYSMSBwg7HQeURsDOBaOs9IiQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/u6pnv1mRcEpwAOL6gHHcMAo1BI2SIc8SShcWmf+mdXety5BVmlG3Tqa69fJIoWurZ+p92uPiqL+qpv9xIMDpBqI1C29GFKDANCo8PmjyzqL\/QxilpQ0WM+mfv782KP0XC\/bLq0CzyUUheNvq41lrMglf7l3bKqrKqgbghtFBAXcHY1DLxaRvwONJvNMHzJRASEwqW6XaU1MqXaq1NKdmpC1naHrRS65ikt\/nxZhT8fcj\/qqf\/OA+XnZPVCwdCu1r1bEzJjowHHMIHVl6RPfO5y1jkT9vrSGEPvRRkp6LoP9O9djW+lF7N1I46yv\/X\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABmIMxsHvGTA3ANjoJSIUB5QbHQM8YoD0guOkYxRI\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/kyv\/oDICk64oAwKdzbRBRmxselGXvtZWrVR8L9ZSlmpF7NFql7KkM33ilL17ETNjfv3MK6fuKa\/4TAdL4JG+JjAC8sCQKBhZkMGwUefu1JQ7Sissi0dY3ASE\/5WteLM3NpdFVK2d\/0uJopFL\/2eIaIsEfACIspmVxxMGUdLPJBk9WcLxhRgyaeF7uTbde1dsO2qNoWg\/zEt5v+li6K3en02qsW+n3qapVVUehVYAXwdMZn4KORcHw0gGzTDADPPCS+ZyIttoat29rnb36npxva7pSpG\/8Y\/uqvZ9+a2SK\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABrsLx0GLGTA1oQjoJUIkBlwTHQYkQkD0hKOs8wyQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/3G0kki\/6JT6cGC5sIXr2YLwxA5yoJEwyKkxbwy2eHrii332vcLpbbXr95+8o9WOiNKFZt\/W\/3Ns66+p1VWx2v7KqZVVVsOeMM7cQKt\/pTTbcrmRPXFhusqcFT8uKjU7JSnteO3bkJeYrv92pmXqi1MahCLHfoc1yBXZ38LocTSKJX\/Ll4rwkzsDoExnHPmjQVa40ARUP3rShUyk8pstWhZU8AYxNLHYzu17dCB+arLnVNmuYaZCWvGC2pVd4jqxDx0UWAigFhgeCgOGAsDgwkDhqOHknhDVonhOfioOh0XCVK3uxVR9Z5RZ73VLc7Z\/\/7Fff1\/r\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABiIHR0mIGKA\/QQjrPYIkB7gxHSekZMDtguOs9AhI\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+qZVPQG4MgwiaGBf6gaHQAcA7gk7ni4uZjTUBWIvCJ9H8vKiqWSH\/\/6H\/\/\/o7aylfp+pWToDBNYeR07bhEbmpkmXbVABCL15VKRcMzhKKkCffvD0LCV9F9H9v9voXT9+v0oT3ezPbzK6pZV\/BUaeDQQKBi4kNghIeUAAOGkBJ41zG3ABC2C7xaEqK8mo2gaGhZ93u6NHRP33\/Pf1fs6N2m6qWpVVFPvASxgQWMLHQIfAZ0wwBER8YChogPkNwYehIp8ZL6F3jr1UKLGUyLNaNy11Ctv\/\/MBxOr2S6f\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABuoFxsHjEJAxANjYJSMUBuArGwekZIDfA6NgkYxQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/qlVT9HCFtEYCAqxhIYFBPPGjdtARkRPA06sqKuSOijJqgSD5gxl7BR927a19jBMhogWdHgEC2f6NCuVo1\/dJN\/5ITHAVbiCoWephOOdGBSYhPg497WMUNfF05R4o9DrKuLqVu9u65Sr+jUM\/ZUjdkqWOUvx3p\/yqaVVVbGB0KmjoBEXOrijzXZvZozNkDwQUsk+9f2WMjbMIGh417lX9jM0+\/kupjD9yu7K6dwp2+5kYLD+amf\/RDYUDY9GUmsDNAoDYqgFgVQnOrlEQslkZMGHVpdi+vdldCaaUpse36uKutNbNwkR3\/v3M5b\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABlYHR0mDGKA84JjYJMESBxwvHQSgRMDwiKOkkQzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/mpZVVRaO56DrhUBYaIuvA4pQWETpNCEHxQm219rmtEdSE9LZKN8LErVMVvt3IUUpy3v9CitfXVM\/\/ADCqcsYaT+XpThK+5YPoZaEUkJu92LG3TxbaiNtU7bQ2hDwOqpHQr1EEOJ7aumK1XdXZo8b90tP\/wFSMAaGFgiKSxLxE4LHz5JqUz21Quk\/RsSMTP+pSFoMtouM6sltotVyzHq17UK9f9286lT6qmv\/QwJm6oTFpowSBMSKeVKBUGgNDLELTfteXZxGtd+0Xt1Fk2MXTStht5JSW73GDZKR0put+GFIsRaNcqhNX\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABqgGR0EmEJA2oTjpMWMkByg1HQQkZMDgAmOgxIhI\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/3dNTKqqcu4dUoFzT63rOfK2rOwvak4FT4sVEhhFb1l3MVC8uldjGpcljqVSf7\/3o2VT9VBLoK1T0SyqqwAZ3GBmdAhLBQIFGy4bPvvIqB4oNAwZNxRt28c5w9jZ1F+RjO+zgVn6WTGXiN69N\/\/K10Eu5SaiSRSlVVe2PSuj5GChabhERSy+5uZJIUOrqEHoatq1cKKc3FLx1Kq76lK+8jt6BLUB219Y2F9bP\/VtX9KmaVbq0ImTN6BUcYKFoYFTZIVeKB8WOoCtmpZGsTLfk3kbhY1+1CLBStoHp3\/\/qma+ec0KN\/7Eqp\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABm8Gx0GDGKA2wZjpJYMmB3AfHSGMQoDzCWOw8YzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/tpVXRIbK\/GquoMhJeAAaIwO0YZWcsCgheT+dvWt1Slo\/ZtvZ7NFtCrww9TUGX\/9eKdop9fXFO6lq\/+oULMCkTsYQxw3ERpwiCITBw6oMKWPPpUlna55QXcmyLD3O1noCN59Vrfo6+zsVtd6br2nnpofsGXVVSyqqGOqG654Rr3KJxg1cWMgXBFz27wkPFhc1Q7WferZPFnOXT3VaFcH8v3oVQh6vUtXhvrqpZVVURiiM21SQTsG0hnMUQ7YfSKLDQgGOSTqpTo\/b0Rrq6BvP1zOVV9FJ1v6W9eILeLdWxt6\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABqQHRsGGGKA2QLjYPQYSB5QXHQYYQkDWhWOkswyQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+mmVMwiXIxqMoNHMSCgMQmVFTh9T4WPOKuHVW9e5AnirHrfCrR2pt+3FPT7bV\/+y7q\/6Oi7qVf\/VmVEjImgsYyDwyke+t5pDWG7ekWDCL6QCQutZa\/mLLUuoLXOA+zZTRej+paNxG7TprVd0fdUr+w2YFYrnZCJDFgmAgACppbkFmIpEZ9nJscYe\/MKbTDqIdII02\/\/VsJcgjZM0UaGSD6mSvvgHoaHbIznrZMBeSeokUJUOR1S9sSuMi5I5scIUUKIN\/+uV7eT0I7\/I667nXd4+jTajqT\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABvAKR0kmGSAzwOjYJQMUBvwdHQSYQoDNAyOglIxI\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/dTUv\/xTJxBHQZUHcQCWKtcYNoXUoJaV4+WKw8aWznym+8JVLk4stH7hTY+rZTapVdSrhyKV9qvfqr+1mr\/0ABxRApMLZULOGB8QgE8JjAnSbApjVDPbGtaLqsYx9brN5erreM8KbqlnK0jGja21ymy7u\/o2L+qpb\/RgfkANTCwQOzgyUPEnsJDzTg47qUzrc19TIjlGrO274tjs2jl0Wiy20e\/\/+70dKWxamqVYqODmNa5Eo0aocKLURJa8oBzRwXZ7bauKcVPLc35hvNsbcXeBXAXsR9ek3bambuWaIM6bf6v\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABpcOR0GDEbA54XjoJGMmB2gRHQSZIEDUAuOgkYhI\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+pmmVVFLCw+BiUq0x2Zk7dBEjOxE4IXLsHbT6j4psahGpFyJLFdZk9fc0qx\/\/+swl38y53VbTZXfo\/mVnfxGhQBxpgPOBdY0cFEHiFCVilA5P6D+LBDc5deVtJkra623Xf2jM0eZ1aml+ebrdiJikij6Wqvqpb\/3QSAYMM6csdMgYKniBwqSLHDxSrAWI+hDqVt0MlJSPtk3JumNqItp04t4E+9NgtUEfVZi9lb6qZv\/ZJRsNXAWYtzepNdBG6Ax5Vm5bEuyS2PQq7E9Jr2WYvwt0ii2pu7+mjZ9r6NSKNP3Gv\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABoAHxsEmGKA5wgjpJCI2BzgNHQSZIADlg+OgYwxQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/6qmv\/udpAq5f0ahQu5k8Ut69LjnARkUekqZd6EqP+\/OWpjv5dn73RdGcscZRfYlB7uC+xzp+pPvnqrqqZ\/6gMUAC0xnGEGxsYqOF0CQ+ZdLUVG5Li56zalaGCjl6XP7O6xXSe1p2ulnflvDt0qKyAH4ioK0QEQ72jW0XCSQO5rixhlltC9yWTJH+z+rbuu\/\/K\/\/8XT\/pWn\/Raf\/FhQKmJTCjpVDiI8DPDTTrzNL42Nva522bTt1vpkYsizxtHNWMoS9UvW5G+V9x6\/11gOj\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABywKx0EjGSA6QfjoMGM2BjQjHQMMZICug6NgkwxQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/7qUf\/QC7gtDCAeTScKR1rnY5OPw3S8Fmn2tYumc9fNt8jQ7J2GP33wCk7fSreQ3OfTpkD73+K1fMyz\/7IWJHoN+UTeiypbslHYJUkUiF6eE0qQ7SyqjXSSjWt6FLzGP009+6VQ2+MjW\/5PWgk25p+r+Zmv\/C5RocFaOE1BakURA5Zp8NFWij3MMynH22vTbdSMa7Uoss9R+UYSpnPRWi5vadpldHzdqUuc+JT6lWv\/XBKnUOOYkQCaE7o0WeDIatzDlLsWrVgBCFiy86n0Q0zDejHOP3Cun+hOURcb96Ud\/9X\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABooEx0DGAJA34OjoJMMUBxQ3HQSMRsDsBOOgkQiQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/czTX\/ibcBmW\/EmZbXoTLrmmrYsigs2TbPx5UlUG3PSpnG5VAqtFA5yaqGdmgZbJyWxyEvsxXbrQ\/U5HDsx3NSvfPSin2\/cxI+6GS1BO4WbTASD4rnbGV\/+JBd5p\/03OBbU+gh7w4oUXzyU9C\/RUqqv0RJlR2C1O5ooI2iOSBkADUoGIU3G9Kh6iquaUUM9HeqXDZk+uaF6d9af90s\/6\/7U+5D66prvEQrZBDKPSMBBO9IQDBKLRcJhM9MO6fK1tdbcglZ\/z1FNViPmHxfT61d6sWiZ+3a0Nvr\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABtMFx0GDEJA9gfjoGGM2BgAlHQeMZIDUA+NgkYxQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/qqalVVWgNEYng2yoNUMU4gIRdMZz4gCgdNhuy2gK01rHuFFN4sWKPrKsU1vyKfTyd7EWf\/Y0CVC0qxuh6WVU\/9NN\/5iDOA\/HDkByDpIqFhOA7mCQJGi0WFB1CZZOinUL1uE62enotY+TVVjVjIqyX1WdSZbJLron9H001f+SKCVoZBQd+HDic4NAAINDgMAuomNFErIsJtOYCeaknrdL3LvTahv2pxVtdX1V919SJsU\/cjXrvVLi+ipZVVWOikBFSMOo+P9aHERVEupECA6q9xWhIE0SNinU51bUa7RVWFON2exW1tLFX1adtrDVnpEWn\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABi4HR0EmMKA\/oYjpJGMmB0ATHQWYIkD1A2OgkYhQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/+qqp\/8GNq8JqpMOKgjd2SB9xFBtRRxxA6tzs2AABW9r9lLkx+hOrOsO19C8nX1JdTTj23a7bvbbp+6lX\/1BKQAHSiMrxXYdQbde6fCFhZTkKaUsbUPTjTPoVbF1eOXRj+iqrZ9+N69Jlercz32VJrqqZlFEYTYc0fEYtGgQHwCeMOgyFQ6dFEjiBV+1T9Ap\/qYPPJpIbjbuRr\/\/pS20vHwf0D+mmf\/YyqopnB+Bs0dpJsatlo4dtTGsTWujws9hqpo11Depc8+sdeu9LHPDyOkyTVXQlUZtxQw5jlWK7dlmr\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABtYIR0kmGSA4wZjoGGMmBsAbHQSkYoDMg6OkYwxQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/6qmZVVVerGRagYRWC0FwUB6cDIIB98Ti4GQWW5a3s+i1K73J9Fa+nfga7s\/nXiFrPtVZpYpjAqR1U\/1Ur\/5CAVoUkAql4p3EUChoTTaHhIs7egehIga5vXtW98yxOhW9zlRaRVs3CvL6LKEN9Bz1IU+jo3hPtqav\/IQWV0JyayGNrQq1BASC4DWJ3gSl\/N2pk2Vk+zVcR6b76W9Me3d8V795bqUzb6VUvZZci6qpf\/cgKFGQKHVmuahoBw1XNzSGjRXc6X9ydj1dZh+v+9A700i8\/NpgJbU+5mj9FJ8cl91C1\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABooMR0HmGTA6ILjpMGMSB1wdHQSYYoDbA+OglAxQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/ySsr+Bwlm+BcPm8rNFB4x51yFCE9CLxt5WbHnWoEzng5KBRdlaGuUuoc7W6zV+m3lP5z9fo\/0f00r\/6AB2CciaMQwqpGgk0NQSLUPIPdIWxcwvcZ6eU8wPfvX9icU+tqFU53Pdc3c\/RqUaDs3SiqpZH\/RjEgg6BAwN2szyHolUc+tDK2WXmsm3xgpoZau9tJ2hyNDqvGoofUS\/Svce\/UtFyL6CplVXswWPFpmhKLhmKSlZGcQNOcyTNuI1GhJNak3knHgI\/pqpDa9CHjDiiJtttWOLWKFdr\/+\/\/S+v\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABs8Ix0EDGSA2wajYGMMmBuQlHQSEZIDUBSOgMYyQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/Wlr\/0QQGipwA72BObeTHjhEIQYaBzzs4s0yzdQ6xUqmUXsGb8i7uu15HTuLCsU6GGLXy6qz7+Z1sv1\/01LKoq0DRAEjyISwZMlavArvRVyTBkkCFDCLxZnpc4Uclq2B5jf\/WhFNmw3cbu6F6FMqm7Nn784inMopoVX1EQoSZuwpxcMBcyER5eHA84IBZwQcMVOmITF0pbFWeKLlDT3f\/09bFDCBsXrR\/+t81I3+leuJJJEoqyqqLFdf5QwlHIwQtCRArMhUnetbnMHtuFKxUXWHAQY16aKFlm3Pc2haBaxDrvVurRWPYpc7\/QpS\/T5D\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABmgHRsGDGKA7YMjoJMISB3wtHSSMZIDjAqNgYYxI\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/6lVU9gVrjiIKNHEsOmAOAQ4kmrFz7QbMnnLZCwqkmwADOY+mKljCKa03CGymz9X7M7\/yNX711VStIUaJsXSwDk4YxFBFwfEI55+IDTQKNePPrrfjmhXxW332flULvvFQ5rbe4Y4yYQwhWsapLRVfZr\/2DKmqq\/8atyMZvaNiOskV6humHZhZEiU1kpq7pZW+pyRYxu02nemIk+qP0d\/fffbTbr\/agdZjj6pqaFVU6C8T1trCXId27Bb6S1BNBGHqMIFAywH2\/WKiuhd2\/avI+jq1o9Vn2Wy3X2ZtHOvKKrR\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABqYHR2HjGKAz4JjYJGISB9wjHySEZIDVByOgYYzY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/1VUv\/iq1kSsHsimOAQaWMCpR0y9wXi1R5geZH7\/3CvfXsLrv99VeijrOoZY6nTXrVxVMWfXGa\/qmlr\/RwcFjngwZQZLkJjGDDZ88p6VEf2UM+hRRKLOroWxrNpbQhNjN1y\/elm2r+n70V8dPVK3\/uH65BQlMIhSNBOw4fWCzjjyoEWy2XQllrMjNvN86gstXoYhCZ3Syi7opTVsdR+Y5LSa6mmEjpRUeYIgA5gZiUGKH0uJtFWVEDI9TiIlDgUEjVNXobWjV4sRFUsQmwIR9tbN75lv9+hKPF+\/2V\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABsENR0mDGTA3INjoMGMUBoQpHQYMZIDlBKOgYYiQ\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/910tKioqBl6yAeSVyx6aXd3v7O+bspAhoOOam8P3rrZV\/qlQGMIb6710km\/duct6\/\/\/3CznxXvsSO+apmlVVbBQolqVubBmZ8ILEqRzeHN+dhSKYWhQCOIPepCh633fFN6RV6d9nkfbtuJ3M7FoqrRfX6Vex06L1dyTT\/TQMZFESBXs+MFnikiDAyFGa2DmvrCRVteQGoi4kRNV0NIT1AAVrXSn\/+lid5OMtO0DqpZv\/FjqzngnNVEJueGCrIDDQxtr8QIKWNtRMjSFSEdDNCBJqnf63s2PY1Ha5CdFK9teq7xf\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABoEDxsFpCBA5ogjpJMM2B8xRHSYMZwDSBeOgkYiY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/6WlV+IseBCqiGJZQAwzSJYuDQna0qYuF1wceh7LYs1S3lxDWnq30\/\/Fen7oSWPOEH6t3d61d+nqVVSSZCgKGDCgRT2vNmBOkVGuH0C+2vjf9Wp8fUwLoqT\/V\/\/1x46WSS7vRd\/V1SqvADIVRwWaLCIXt32JO2H4posoHgjxAtROx\/lqVIb\/ShH+zH3HNFnT\/1ps\/0\/5qpVUeYscKAFAxsOioUaTKtgC8+SAx9ilnKGs9X7rinoUiqpY8Zjv\/97f2bf7PvdR\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/uQYP+ABzwJx0DDESA3AOjYGGMUBbwRGwYIwEDChqNgkwyY\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/NTL1YDGCkx2lwmPGHJYDrPDQGg0grvUmxv\/2M\/7qr8zI\/\/\/RWum6KdxdX1vXUSSAAAMTRsxIAAAAhBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\/\/uQYP+ACgsDxsDDCBAuQGjoIMYAAOgBGoAAACgYACMQAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAxNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],"libraries\/H5P.SingleChoiceSet-1.11\/sounds\/negative-short.ogg":["audio\/ogg","T2dnUwACAAAAAAAAAADDrUxAAAAAAGQEC8kBHgF2b3JiaXMAAAAAAkSsAAAAAAAAgLUBAAAAAAC4AU9nZ1MAAAAAAAAAAAAAw61MQAEAAACVezb7EUT\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/8HA3ZvcmJpczQAAABBTzsgYW9UdVYgWzIwMTEwNDI0XSAoYmFzZWQgb24gWGlwaC5PcmcncyBsaWJWb3JiaXMpAAAAAAEFdm9yYmlzJUJDVgEAQAAAJHMYKkalcxaEEBpCUBnjHELOa+wZQkwRghwyTFvLJXOQIaSgQohbKIHQkFUAAEAAAIdBeBSEikEIIYQlPViSgyc9CCGEiDl4FIRpQQghhBBCCCGEEEIIIYRFOWiSgydBCB2E4zA4DIPlOPgchEU5WBCDJ0HoIIQPQriag6w5CCGEJDVIUIMGOegchMIsKIqCxDC4FoQENSiMguQwyNSDC0KImoNJNfgahGdBeBaEaUEIIYQkQUiQgwZByBiERkFYkoMGObgUhMtBqBqEKjkIH4QgNGQVAJAAAKCiKIqiKAoQGrIKAMgAABBAURTHcRzJkRzJsRwLCA1ZBQAAAQAIAACgSIqkSI7kSJIkWZIlWZIlWZLmiaosy7Isy7IsyzIQGrIKAEgAAFBRDEVxFAcIDVkFAGQAAAigOIqlWIqlaIrniI4IhIasAgCAAAAEAAAQNENTPEeURM9UVde2bdu2bdu2bdu2bdu2bVuWZRkIDVkFAEAAABDSaWapBogwAxkGQkNWAQAIAACAEYowxIDQkFUAAEAAAIAYSg6iCa0535zjoFkOmkqxOR2cSLV5kpuKuTnnnHPOyeacMc4555yinFkMmgmtOeecxKBZCpoJrTnnnCexedCaKq0555xxzulgnBHGOeecJq15kJqNtTnnnAWtaY6aS7E555xIuXlSm0u1Oeecc84555xzzjnnnOrF6RycE84555yovbmWm9DFOeecT8bp3pwQzjnnnHPOOeecc84555wgNGQVAAAEAEAQho1h3CkI0udoIEYRYhoy6UH36DAJGoOcQurR6GiklDoIJZVxUkonCA1ZBQAAAgBACCGFFFJIIYUUUkghhRRiiCGGGHLKKaeggkoqqaiijDLLLLPMMssss8w67KyzDjsMMcQQQyutxFJTbTXWWGvuOeeag7RWWmuttVJKKaWUUgpCQ1YBACAAAARCBhlkkFFIIYUUYogpp5xyCiqogNCQVQAAIACAAAAAAE\/yHNERHdERHdERHdERHdHxHM8RJVESJVESLdMyNdNTRVV1ZdeWdVm3fVvYhV33fd33fd34dWFYlmVZlmVZlmVZlmVZlmVZliA0ZBUAAAIAACCEEEJIIYUUUkgpxhhzzDnoJJQQCA1ZBQAAAgAIAAAAcBRHcRzJkRxJsiRL0iTN0ixP8zRPEz1RFEXTNFXRFV1RN21RNmXTNV1TNl1VVm1Xlm1btnXbl2Xb933f933f933f933f931dB0JDVgEAEgAAOpIjKZIiKZLjOI4kSUBoyCoAQAYAQAAAiuIojuM4kiRJkiVpkmd5lqiZmumZniqqQGjIKgAAEABAAAAAAAAAiqZ4iql4iqh4juiIkmiZlqipmivKpuy6ruu6ruu6ruu6ruu6ruu6ruu6ruu6ruu6ruu6ruu6ruu6rguEhqwCACQAAHQkR3IkR1IkRVIkR3KA0JBVAIAMAIAAABzDMSRFcizL0jRP8zRPEz3REz3TU0VXdIHQkFUAACAAgAAAAAAAAAzJsBTL0RxNEiXVUi1VUy3VUkXVU1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU3TNE0TCA1ZCQCQAQCQEFMtLcaaCYskYtJqq6BjDFLspbFIKme1t8oxhRi1XhqHlFEQe6kkY4pBzC2k0CkmrdZUQoUUpJhjKhVSDlIgNGSFABCaAeBwHECyLECyLAAAAAAAAACQNA3QPA+wNA8AAAAAAAAAJE0DLE8DNM8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEDSNEDzPEDzPAAAAAAAAADQPA\/wPBHwRBEAAAAAAAAALM8DNNEDPFEEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEDSNEDzPEDzPAAAAAAAAACwPA\/wRBHQPBEAAAAAAAAALM8DPFEEPNEDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAQ4AAAEGAhFBqyIgCIEwBwSBIkCZIEzQNIlgVNg6bBNAGSZUHToGkwTQAAAAAAAAAAAAAkTYOmQdMgigBJ06Bp0DSIIgAAAAAAAAAAAACSpkHToGkQRYCkadA0aBpEEQAAAAAAAAAAAADPNCGKEEWYJsAzTYgiRBGmCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAYcAAACDChDBQasiIAiBMAcDiKZQEAgOM4lgUAAI7jWBYAAFiWJYoAAGBZmigCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAABhwAAAIMKEMFBqyEgCIAgBwKIplAcexLOA4lgUkybIAlgXQPICmAUQRAAgAAChwAAAIsEFTYnGAQkNWAgBRAAAGxbEsTRNFkqRpmieKJEnTPE8UaZrneZ5pwvM8zzQhiqJomhBFUTRNmKZpqiowTVUVAABQ4AAAEGCDpsTiAIWGrAQAQgIAHIpiWZrmeZ4niqapmiRJ0zxPFEXRNE1TVUmSpnmeKIqiaZqmqrIsTfM8URRF01RVVYWmeZ4oiqJpqqrqwvM8TxRF0TRV1XXheZ4niqJomqrquhBFUTRN01RNVXVdIIqmaZqqqqquC0RPFE1TVV3XdYHniaJpqqqrui4QTdNUVVV1XVkGmKZpqqrryjJAVVXVdV1XlgGqqqqu67qyDFBV13VdWZZlAK7rurIsywIAAA4cAAACjKCTjCqLsNGECw9AoSErAoAoAADAGKYUU8owJiGkEBrGJIQUQiYlpdJSqiCkUlIpFYRUSiolo5RSailVEFIpqZQKQiollVIAANiBAwDYgYVQaMhKACAPAIAwRinGGHNOIqQUY845JxFSijHnnJNKMeacc85JKRlzzDnnpJTOOeecc1JK5pxzzjkppXPOOeeclFJK55xzTkopJYTOQSellNI555wTAABU4AAAEGCjyOYEI0GFhqwEAFIBAAyOY1ma5nmiaJqWJGma53meKJqmJkma5nmeJ4qqyfM8TxRF0TRVled5niiKommqKtcVRdM0TVVVXbIsiqZpmqrqujBN01RV13VdmKZpqqrrui5sW1VV1XVlGbatqqrqurIMXNd1ZdmWgSy7ruzasgAA8AQHAKACG1ZHOCkaCyw0ZCUAkAEAQBiDkEIIIWUQQgohhJRSCAkAABhwAAAIMKEMFBqyEgBIBQAAjLHWWmuttdZAZ6211lprrYDMWmuttdZaa6211lprrbXWUmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaay2llFJKKaWUUkoppZRSSimllFJKBQD6VTgA+D\/YsDrCSdFYYKEhKwGAcAAAwBilGHMMQimlVAgx5px0VFqLsUKIMeckpNRabMVzzkEoIZXWYiyecw5CKSnFVmNRKYRSUkottliLSqGjklJKrdVYjDGppNZai63GYoxJKbTUWosxFiNsTam12GqrsRhjayottBhjjMUIX2RsLabaag3GCCNbLC3VWmswxhjdW4ultpqLMT742lIsMdZcAAB3gwMARIKNM6wknRWOBhcashIACAkAIBBSijHGGHPOOeekUow55pxzDkIIoVSKMcaccw5CCCGUjDHmnHMQQgghhFJKxpxzEEIIIYSQUuqccxBCCCGEEEopnXMOQgghhBBCKaWDEEIIIYQQSiilpBRCCCGEEEIIqaSUQgghhFJCKCGVlFIIIYQQQiklpJRSCiGEUkIIoYSUUkophRBCCKWUklJKKaUSSgklhBJSKSmlFEoIIZRSSkoppVRKCaGEEkopJaWUUkohhBBKKQUAABw4AAAEGEEnGVUWYaMJFx6AQkNWAgBkAACQopRSKS1FgiKlGKQYS0YVc1BaiqhyDFLNqVLOIOYklogxhJSTVDLmFEIMQuocdUwpBi2VGELGGKTYckuhcw4AAABBAICAkAAAAwQFMwDA4ADhcxB0AgRHGwCAIERmiETDQnB4UAkQEVMBQGKCQi4AVFhcpF1cQJcBLujirgMhBCEIQSwOoIAEHJxwwxNveMINTtApKnUgAAAAAAANAPAAAJBcABER0cxhZGhscHR4fICEiIyQCAAAAAAAGQB8AAAkJUBERDRzGBkaGxwdHh8gISIjJAEAgAACAAAAACCAAAQEBAAAAAAAAgAAAAQET2dnUwAAQDkAAAAAAADDrUxAAgAAAKJ1IqciWEBEOC8uMUNeZkQ60K+\/x73\/B5hjR\/8K3u7\/C\/8k\/zv\/TnRj5iWqdGWARKG7Xif6sZu6qXsysGxfdGoWT403Y5Hczlb3w3RVoHIqZuRg7NnO5JXBB4+NP9bf5vPD2lHs06E\/7Pr50Vtv+YXv4srypKqvj6NdoxfW0V+8Qsg6iNspVkps7WUyK3CSbCYmSlKsWTmWvWe5aJf33qd170PzfJrHepqLJ20\/vXn17KH\/6VVpj8tV\/ehprk4nnM7B5UEUEZzOcbmCkN9UNBEWCIDuDJa2+W37kP7r+8P98WMx919jzv+erO+Z+fX9ZH8Y79r8\/eP4Wt0w+dF0\/hSjRqucTA9l8emdTA9vBWNtD2wIAysA1Ud87593dz8M0gSivDaRkLbqPepFVGTcjuQLB3uJbkQ8VGonGZxK7VTQNKdSNxW0z5GqJGBHBWD383JuSuDEU27\/dLfCa9qrFFwVbfuLzbqJKhEAnMqUrvp3KlOmgqJdmyAqFYCQTyLDtIsJPIIISuCBWkpLvFcbOqPyrguaBbtnBpzMcl1+cCczRysoejdMEeACGQiAaV81SGqGXkbiNAmykl40AyGSCoXh3Zpc3W1w0AOczMipIMKdTA03thnaRIcQgDhLiw0PhVib\/mu\/xx7WnUuPWhsWEA6aiKVVOKwudaUs1k5ZSSVXlepENHLxgqFBjA0AvMrE0E2qtCttdo9bLP3pLwDky7RMNZo+p4UDA3HVDks80cQH44Lq1S47yXrQIlXEGAmFoVaqkLZM5El7efvxdqmf\/3vwzducx5srj2826SVIU5AWE5fYuLiYHtoGAFTbujPsVd26J+mtr1NTyLLMfr\/f7\/en3wFAGVH3yo2L7S0sNERGfDREkUgQF1cpUkVMTExMXIK4SnFxkQqRCkGkQqVKyzRRkZ9Jmn+sJt9ZHLv3ntjdPz9aucrYqhOtMkgPiXHUAZzvk\/SIP98nqZ+w00sNSWYwAbDacHRAJSYVGw5Wikbaptu0TduEQSgvsfRSoRK5mlcHarWq0na+Xa78VD8\/bfqlroYKhO\/vQCf895637wx+PdMzwfwtKSsQgKQ1iMm6YDU2rxYbbuhFhhWXS3dkvhmq3j+CxLv0Fu2rhWWFBvqsrv63gByKGkL3Gbx\/Yj\/6ZWh3Jd7ys7rFzSIgh6Kk1P0KPr+xH\/XS662EM7+wvd4BFgDgvAJ4OQm89HQrAQAAVAAAAAAAAFGpIgAAQC3JDWnzc8\/Kft12MOwsR1mGM20CNGtUtP0QfZAgwU0tEHwg+OCDD+m7vX2kooWHJrzYF\/++PnqNNhKtEFshNqbqKuLjKkZi42IDi1oev9\/8eDiyeknPHSZtWQB09+O4qwDAB0EZoN9X0ObFxeV9AAAA9359HZcA4wQ\/QHIJ3AmhSQD+jF7YH4H7Ulnuy\/f5P7Lfv3mv2M9hsnnCfwUOWpSW9+L7\/IvM\/hW7sR+DF4AWAMBZg1NYOQAAAAAAAAAAAFCpsFIAAADCpPV5XAjUmkaJkRDzBAAyOjWW5bYrnX+IAQAu8rx5srTtdcVv25AIQmi5FNdcWtP45q+\/tXfnDxVvbg0GKRngAADfGngauiQAEQBAAqcTLEhUYif+1SawHoYFnkIX5198cB+UMgonAJkNflyezGYLvMD0OZ\/e3\/8x96ZvLvX4UDye2eYy2pc+T\/H++Yu5Xx5cxn4U\/gEAAADW4XDKw7wC7Pi+GbByAABYDAAAsBgAAACAFZWqAAAAAJmrAMxfHQDw7c7d3XtjfX9qf9cEAPHbvFaTcP+yAwCAbOgIliaVOb096l0kJATVIy65YYMAWKY\/sz+7v\/icyQIAAIAnOsK1cmMIAAAAGoALAApMwAGeWUJIEIxr6xzAiKSj+sNEJSzZoAMOZ2J5iALeKtbcP\/q8X7ryP8\/vP31sSrocC3b4H3vaG9b+6\/3zV9cvlylx6R8AAADgdjj1oQp4BXDzh9HAywAAIABgAIsBAAAAGMCKSoVEAAAAY0w9BYB9qwPlbvN+ZODn4afvd9rvyRcAmV\/WeSzP6lUAAACIGnTf36E70q5SggCEnlfaZl0hiqKzfzyTC\/sHU2EGAAAA4I0bdn68CQDABgAqgAMA+AzADwAADNhwp6gAn+EAP+80DvVHlYGj4IyIkQZiBa5vDAmBGAAK3uut7D+veJPl9vx763OTl2e\/nv7TK57QXbf3z48+hxKa\/gAAAH\/+lxdzXM0vr2brcB5W6gIn7wIAWAwALIbFsBgAAGAAqFSqIgAAYO\/XVwEArLz1vHjO6AKBMK7mTpp3M1q+YxUAAAAAZ++XMe+4s8HoEP5x56bLrfWvjy5+\/OFci\/0fAINNEgAAWA4LAAAWAGgnAOAD4H0BAJBXIWDjRBTU99qJACGgPsrKqCRJyJ8LkfRBq5ghKBAyASADlhvW8R8T7wUJyd\/fHfIQV\/xyw7Pc3DMPYTg\/bzmI3z8AAADAcuMur7J8GQAAQKVSQ1gsFQawgsVSVREEAOjNb5sEAMuWbwsLiM9d\/31qvv5\/tvB09nR2vggAsLOtxz+udNbtP\/H4jf7+XH8uN\/Fu+dHV+gtWg3PDRV4fz75VXuhFfh\/feHvaH2829pUD3d3ddD89n\/anaZqm3nvv4XTpFZdLBxVFcSmKSwhhlxqlRgMAsEAFAFBQgVWpC2VWCMgqUDGNiCtJkSRJEsC49c8CgGEEGHYBYAHAQlMrAODAApcLAAqggdBYHtBSjkHnv\/+zro8A4\/AxHB9nSI+Qd\/VfFWD\/+wDQAGTl86hru40vsHa3K+3fvvrLu8dVqY9hpUWlEqq1tQCrLWvrVsuMSk2lUpyczbi18iet1uee3XPWn97f5eRkOaa1YusDgA4yxtSHpnyLO\/UqmH6iRnEzFUVRhFEIbrc95k\/ytT3Onuw3\/19GF4vabEl\/j2Ff3vhB9xe5HrJMNzTZHTFQMM7yuZvw+PfBTzGqof+Awx6VFAwYpOvzc9Of7XPxoFttzqjuaqGM9M3HuZi2vywA3EOosHWIbmt721Szc73Taro9evbQ7dGzR1e6nbYJicQuT3f1XYGJpOvQVhgcJjp0fP1Tl\/I4HLj+0s+Xl1f6loOoqg9rymoBnO+LSwOufFvyB22lTVSmx+lsCWAIOUYAqn4NzUl4+bMxaMNw2bglFlkvJicZKn3Lon6b2APBm4Ov2WPavqmfbydnqU5aNQCarN6k9tB5IcX19vYvEg8uYT8xPqs3bvnSb9vZblH\/UWSvj409GPwBIBKRWPvp+2b0gavpgVcdANiv3\/7vL89Pzw977bXXXpuCjKgAAAAAAFQqLQQBAACEhqdHiY0VZohl2vCvmJoZiw993rOYhoqKYt+SMwAer6ISt3OlvVHXdc9WAeHUKocCjVanX6tMyqW1TCrZF1X8+TdbH3I9aM9+m8d6pl4v60vn3\/\/+\/fH9x\/6xz+vZZ7sz+\/Pn\/5t7efEAx54Z6Afogvx\/5hQAJBh33PcTL051uG3rW+6O8qG47xkVAVCDDWwA+Gje4wZ+gMrP+C3p9FMED3z\/w2CSbeo66SxgJ2CAbDIAnnx+Ti9dG0mP8u3ByMeXwNgdgmX0q931jJwe4aeTRz6+SIvdQfgFAMCb+JKHyQ7g+ffeBwBmayUgMyMEAwAAAABWVIUgAAAAZusA6IIOHHPbD1lKCdK8tRYAiP26BE8oIAiwOrczoeDRHIKyhbBN2kSOJrHSzlsVFFqb+pdfvHzfeKawqgXss9aPjga0JmFXJrmYmaGldSKqij4kBXOS3glf\/yIhlyjm7KkBqGZvoKMh4QA082d2IQblDQCQsBLQRgAFAGwwLCAqnUAC33uyUguASQpzK2yDCb\/gAxQAPkze1P7QtaF0zZ8ejHwcS6aeD5LL7\/YUiCOl1\/7x9D\/yIVamks1\/AACA8e0hwQsSBgBg9upjfwQAJSMYUGExAAAAAFGpkBAAAAD303UAeLVW2jOwCz9ZPr7RBABuX70bAMC4rQDBAzIBIAIp49lUF377Z5nvVQcAAIAMDerP9x\/PtVm5gQd4HaozW3kfom7q\/cpd1FmBzHx82DPyfe77Zf2x3zJauS7OAnflRmiuU\/24mgnPfzMzTF55VcL6UaeDBd03C7SBH3sNAMAHFQBwmQjH+PiJJDIieNWs93Y6ZnGiIzsywRpstREF0LbBAX4LfsT3M\/xmeT6d8RfpPUgo8dJu+Nnfz\/YPHz9P3\/EX2XpWKPHzHwAA0N\/95RL4wdq9AfB3AICXAPvnmwSvHv9sAEDJpEawmAqLAQAAVlSqQgAAANy8IACYZU2fEiqTux70RwJA6R8vAQCA7H0d3Xb+ULb9lvMuDz7IzEAkEVE0NV+xocxorox3twIAAByvANhsatBSBjbk5hTp3bfP2Xvbj\/vc6qHZGeNpTE9+5ZzcACS7K19qT64DQM8537qlog7JeBjqE0OOSxRORZb5+FlKrR00vBwQHPYYBV0B60PA5gIAVA0AAH0AcHDBaUlA3gQNhyInhmPx4VSd63r4CpIPGsqkKtoAKAABHtu9xY99\/Nzy73bPE9k1Hdf8edZ7d+8n\/9Pys839jEQPkcmXfwEAoGMUvXAEBQCANfgU62ckkHQyIiqViqhUKpVKFYIAAAC49SzAEygDeyc3f7sXXtbasnLf7noKAPO\/f+IFAACA7V39WZ+SvYRFX0ug1eAzZeIBnDAMbTnTq+5B3zr+ffwNAIADjKsB\/iJEdwJfZXQOQ+KppWHTMI6Lh+yuXP2P2X\/62Hq1pvkzB9wQJCSHPCSze813Kumc8xngL3CnI7pv479z7GHeuN9nyDTlw+UEsTG092UOSSicXC4Cuave++H4AGDPAo\/kvoHLBoDQAADDhQUAABcAQGGRAGAB+ODHWPofGKoD8HARSMAiAA8f6BGr\/S\/OaTQsLQJkhwICXppd5O9z\/M3y\/Zpm+A21OGsKzS7yZ13e5rqfnoYeUJOXfgEAcD2IHzQ59hzQ\/AMAYLbeBZCZEZVKpVKpVJpKpQohAAAAyqegQO4IQ1MLtf+xKNAncsgA+ZurewBg6mjaHWdfUIA2ABESpW3unKIj0tuY\/2vLAQAAwNT6zMvXuXa629lCG4C6e5jrMKj\/+FRenCooUexn\/sChXBGJT\/fWLurkFecotTa\/s+OhI0Edc56uKiFg5nEBYjo7wQDQ\/PZA9+f7Q+Rk0eGfCxYC+PDaxWVDFasa59Uv3AyqxskeqA5+SHClcQbHx3L6O\/U4PkR\/FChPHWgcTp+IDAkcksCShrDNagHrsY8LfDG\/VoFDAcPwFAAUZ\/3q4OkBf2xY70Q4RzKeL7Q+AxnyA77oY+AoHoEK49uCRn7Shwy+Se3+R\/06NOu\/f55KqBkKzpvUEf8qN6\/rztMRwr+JZGnW9AWwPzv7oasOa9uXf7YIJv7Pv7\/tALCG44X1MwDZ6YhKJ5VKpdI0lVYBAKCr7YCk6K6c12\/r7IN7lQvf5nPEhkARoADKJBPufl1Hi5l94G7dWTPeewKU0vtM\/mvF3+QlSustu\/Y5hQX4mzWVPlM9ux5ow+eLzVqdj+mzWZWbSnJqxmJMe155qH3Kw3TUv09Mu6cucrXvMWc4AdzZLAh3W5oRTxUwpU1HXr5PAdf+VIj2QeFgBCDB2gtkMs35\/AA47pJ\/SZIbIJOTBggPNJN2WsWG\/XD68bFs\/nF8jd3v\/\/8MfIYfXfUGjmsNCIcF9iyUrCSn1x\/D5e9UCBzN\/L\/BCDPtNMnCiVYrAc6PBjYM4NQDjh4BACqs9Z2sJPmCDQCcXTPSHICjEBTIRABPZ2dTAABAbQAAAAAAAMOtTEADAAAAQELvsBr\/Uf9G\/07\/WP9a\/1v\/R\/9M\/0r\/Of9P\/1j\/Sr7odNx3\/AvmdHBbsFDo1Pyv0t\/A7UYLC1+MbrNbv\/7lNwDy28MDmPiH1QCANTjWvPr1FgAaMiMqTaXSdESlUiMqpALAwnw1lbKTj5t8m3PXlz+meSYzpLGx\/AqeUJlQnq5flkq1srB5XW0De5sjAFC8ynPW5vlfti4uoVD2l2kDwLtO0WrgmaFupiHOk5QyTXFyyP7rNx03Znq03Tmq1kpl5LXc\/fRKn\/jfJDRDfa11fe3\/\/NcMxY6P1W7+OPVVabwk080dv+MfZKdkzH013w40gJf6Qts6HQs7fVV5uOLnmJP43al2avmPcX\/9pPD\/c8yNBvwk5rDvaYdwofNfBcA+QJKPukDJoWq+6gDDRf9ULxbin7WGKqHzie9\/MMqr43P49n0iSLiaERfRl7kGtkrFZr\/FSDD4+Z8PAMS\/Ll0DDrLP4aMcgCMQCIDQBAMGAH4o9dZ3075gF0dwk2WcD52Rf5f+FW1qaEHwZY5maMarvxWAuav\/8ybAlfPg+csNAHCB7\/Dq6esAYJ4l6SiiqVFEpalUKqQIAOrUCb\/JW8toDv2ErFtXnokKIXR5st\/06AuCUPK1s1FWoAofVgWvdIQux1\/oTlZDYPUSNHgtqFNbgAn2f0WTJN3vnmE\/eyh+fNiZ01HOIRk6yeSfNFmHPTnuuDm8naG2T\/1ftQ9AD3vPn\/9c07WnvvbOczdzEkw2tGJU0GfI8XV2J7H41PGBEeUzjV8uWLj\/2zDJ6Q+E\/gHyWMVXZ0\/A9ADy13eSf3zUD\/FhcSjvVf0EvkODCzicDszvh9OSDAOMQEMwwP1\/1fMAuA7AMzKNZbOYPmB\/EgCaTACcQEDT\/6Qqf+4oSSzwAZdfqSw5BCgnJwcwmJWtAtCqTRAygAC+OK3cd+oxxnRrMgPuQqdTvlJvMG9vxFkY\/gAAmGN\/W+kB5t8C1nGchrXugB5lRAFNZ0SlUqlUqpAQAABYxcBzOGEvJJ1M0fyZhOA9IJQcBB9CYPwd2quxsGVt45ttBh8gl9xB5ORcOaVooONSS28Z1upJL\/\/u63pqv+QGfEUVAADA74Bzk10tdDjjcpt+3V7r9fIwzl1Jw11Fk8UH9axw7pzl8Lj9S8eTGBunyVx+s3d2n7zzTD6M6TwHoOvU+J5JZQsOZ\/1\/5cDz3BCBAPf4xVZrhGldDAVo5hWGD+ElkbQDlJw93w8NNIz319nZ\/QIc2nxNz4Chu9zC8J8iW\/75FSNDDg2Sn4jg19GFY05f+fO+YOiUkzhQ2GYCnPxZi2D+8Y+Duy+6mxxH4Su\/WQ46iRIYZ6+5HqzjZ7ifABYcdHT8OL7tQxUfyIAPDgC+KI3gV9pnesURXNUV50GnVn7S\/0RxcHUMfwAAQH\/5+8\/AlQ\/gm6VhDmD26purAQAyM4qiZEQ0NaJSqUJCAADgXCFD9jP84Ofxs2bJ2r+yt9AGMu0p6t\/b5xOYAR+uJZUznpxn9sFDYWoonRfTF3V6f+qvgjaTz1p\/Gqlw5ZHwrE\/916oAtn2TYLpz3DyZdx\/iHx4VCZvOjKoSmHZWVdUn+wy83Ke\/Hc8XAAxQA+9kXTfPfFGcU5\/a8XMGoPvZ2VV5AGa+Fr99hx7N01uFNlV4KUnnkeLzY8HmTPG1YW8Gx\/35+VWzgcMRCfkKzAYgmT9n6\/Sn2\/2v6P19F3XfxxE2DVDml\/omjn\/y\/qGorxP\/xabnZy1gwwa4gbg5l0d\/CMlPkt\/dP4AKyNl8NVj9Y\/S\/wN7xAAAI\/+5UpKNDI8eJTR\/m14B4mwHWCRB6WR9giHsACFsIAVwA3iid0Gehu6G5haBMhEPi1JO\/2\/s3WvFUnASHPwAAQOubtxvc1AVYXo038wYAMjOKaCrdoFKpUURVEQAAmPxsQfAdmeu+JWampzX+Gna+x7LchqJhz937FUqoyuUBh1y2sEhk+59Nt\/XnVfHtv6zP8u2eG63kswxTy1mpw5cfaqHprSrpZACAdx+SOjeTRb8kOenePsVhTeicenfUqs1NsTy1dp5dDNSxTZG7m73k9LAngc5fvbtQ7lOf4vp8QdW5s8tsNuwNz3X5lCtgwGTOqafAyeGnzn30FN\/RgrkaKrd\/iOqUPsOn0j8H\/OQKvzp554LPRB09\/y+GYNj\/wwak\/Jc7277Z4x6r\/gP48x+UXmFnsaQASDEfAY8UEf+gszOnjx9HZ7GcpuClhY6wSbRTP8jEPoHMkr0pAJKWe+PA5sR\/NXnAwQ\/Q0QGcYEeR2Z4YhkdobGnAdgYAXug04EdNpyA1B5dqQ+V0ZR+136ZPxT1S+IVw\/QMAAPb1nTTfi9vbgNnaC0i6ZBRl0lQqNalUVQAAiPHuLITS8n46\/ux9KO\/7NzivGCfaFsBPDgeSyR7ofG6l6whxXFFdTM78eUrP8qc7d78\/stif6YtGa52OXOa+6NeWSJv6zOGbBujv6Sr\/t8NP5VVPT06RSYfN4dMbp7LbPLfmcMPm296fPb+Omao5ZPfZB\/pc6n0yF25v+3XW\/XZ3y88zmn2SOae+sz\/VX82m+nz7sPPMPmI253bBvRv\/q5fD2C+q0Yb9lTSnEv7sO4oM0KuBs32EDIBzP7KV59sBpkdVLgROPrCPMkHqOSnLzzQWgHMzeP\/+fHyQLfpO4DTNPrjjz4e0YKSEhbVcYrSIq+1rnO4HDaqTw4b0C9O9t6m+ygixB4CdFFaTvJMYGPgAnACwiMIesBxgSgiQwQAoAF7odORnuX+B4J6804RD6IiejT+JYQguQeADTWj26P\/xH81D4u+Cx5vgMMCyo8xMakYRlUqlUqkqAgD0tVTfvQbiiy8v5ezune26z\/WXFCWIa29c\/400FzJh5g+Alpa2bX1pSxfN\/V0Di\/Fv6s4TAAkAwDPk\/590U+yjntVyY87c707NO+PXzajLM9lXJln8EdGPah5nKjfpU0+yspncL9XOaT4j6s46O+arC3IY+Pc9PVdThnsGnq5h11F7ejbPPjDtJ\/NQvUswj4CGB3cJnUEgrhffPhxLDBxEjmTDn043z0OWDnPORuY3G+AgmvPbdG6Qt+gOw1GdjYF9X8AGnBwfLWeUE4ufnPpq\/kPhcR4p72f78\/MBiyQBag6AAJ2QCwF4RwaGjg5QjjlABJIE6I+fFns+jiUvnKoYc2Qg4KCZDWiGjKMBHuis3KtYXyIbuEKBP6cn3ioDk1EMXKGFPwAAge3nx3cHuGngOHvlrywARJkRHaNSkxpRqVSqSAQAAF4th0oqz+PY9kTJi215lbDBbOYpFJ7e8yd5pMAHHzyRQyT6l8iG7VPOle\/slNddtPq8xdT7zJSB1nJf\/P5nX3mk5JugtAVIr5POQ15kkUXvp\/P\/ryYvVddx5DlG4fmnZg\/ztdZhp5KvvmZqesT2eWqKieD8+rc85lews1S9SstMnp4fQG+sdJpVftZwv3s4OX7MXy3nx2TRJJQYyPlOtR+oYn6KJugzrW1m9Yr6J2XfVvzhj7vqH9jUkR+HM7GT\/\/bx5z92DoDFd5TA2fA3YkKGWT+3OvHzg8UBTpAAcPhiA5Y6NXz\/w4ILOHBcAPj4AX6KmoV1WOCebdLAcg4U4DxguZof+GmfBsUN6wA3wQAECz7oLMRH2d9E8ZRdckOf0\/Mf6V8gObiaGn4BAPBXRSZ+swGANTgWWS9rILNHmTQdSaUjKlVFAABwriLIVemVnfWTm5ffeoSi04d8tg\/sLFASCMWX3dO1xxG\/VOgPpfY2+0ABfFaIbHugtqEmZbfzGdyaZ97U\/bevvivPFJjqOAFQew97zg7rX109NUCDnMvZ3ndzm+nksHX37sMh619JJ8A+L1NK51QJt33G49e4xX2ei+7ec9dVNXn1PlwJQPZUdhwvx7JrO888giZH6U7OAIdz2F+5ffKT0AIdNpuD\/mWAAhDmkEZXxnkA5ntB78k8gphrfjUo+VKW9+YcfJM1GHEYw3\/OiqezMmwv1UzODfrmdsDhAHD8T+WHhf1ew2YD\/OlsAxvjgQOYhwtVGID6IRLOeWZr4Iz5aAEAHghqdCt9wABbZ5pjOwAF3ufsym2mb7I3yIhDonNkz+F\/IhmEfwUaviwdXJdftB8A\/WeXwOMjRzg+BqzDByyZmVQ6yiiiKpUqhBAEkNRvDV3mMdFXm6YH1VpHNIv84HloqN\/n4EIG7h2tY+nn3AuhR\/AZJXuhv\/vnmAvLAc7UgQQA\/q\/+XZtEq3eYChSy+XOA4m7GOWKmCkj40F3d8yZUIuie+spP7bRPnxY4P+qz\/ycr\/6pRTW32eoBmkzVTPe9weoDFBZt2VuK+eor+vAbG1g\/7v+XI6Y8T4hfJUfhu5tgx3N4Duw5775IEeID9vTVL\/Phfcl0wgGAOoD\/b+w+2XpoDn9ObJAF9px\/8WvqpC16AgW42vUF\/sBzMhgaWUzgtMIubLBlMToO5Tj8asICB4yjp5153E8YJUHhnAIQIR80GMsrQgZAB\/udMxEcRr1vLcHCTZOhzJu5V55OIduOKAl9oyOXtzS\/7Cuj+8LcH4PEC3wHWoYD10wMyM6NMmqZSqVQqVRUAvK5\/1g7x7cfYK3s\/k4y+eWCilAbnhVM\/9nh8GKw2lgu0K\/6U7H2mhJYyNqKFQATk79F+CT7Qgs9tcFcSEgCAmcxx4\/MDaDgcPpOIpeEZuM6h1ahYmbvZNDW7soHsXZWp97yHPtn91bs+GnRamdSnOExWf9R12vrG1Gl2g17NO4cC0p1NFRy59j0m+ceRWLBzGDjnixxIH26KAus6SecmGQYak9IX7PONk5Sxho+blWqYin3o4gc9k2A2H+PiAEDQNB82m4n5+PmnMulwejnxoSvcD4X6uPoXyfASU636AA+6k+1FjnB0BToxKH54WB2yBOBU\/nK\/5+K4g9eJi\/UZzkJJHWM2VB3gAxQxEIBqA97nLMSzjDcxPJEaAp2FeJ\/nCUvLTuMSRcwfAEAD\/O37qw79dmzAbH0AmRnlQqUmHVGpEVUhBAAAHvfh51nLh2\/dPoPwCyu\/ny\/R9X0o+Hbw+4VJIeMBhaAQ1hjKT\/9G3BnwmXPa7F\/+07Xpztmm5WZmAFpv9d98p\/wlWSCfBQCpnuPd\/SV6d+XJaJhm1+B212x+vZnN4v1LdnauPcTDrhHTpz7dTjg0FyeBpqs5SzF8dWdvGoCTdK90bwoOu5nv+CF+VKdmcMm7HrLbcD7jOrDzMkCfmJ6z5w4F0AfG9OGcBP7r+P9n+cnBbf35cfCf6mydPvhNB5ITSn5xfIYNP\/gfaVMH\/rMh+VdR2+mnr7Kes72GNDkb6CtB0FAHSnea7z\/+85ofdpQc\/LT++wwJeDioJfBvwaceVjNFMgDjmyRgUfqULzfhgOe\/UUf6fRXoCJARYMMMTRUe6EzoQ7XDQHPjqtTQ50zoXduXmL6iJPiCnqI39y9++CYgjU8\/GWDifywsAGbrDwIyM6OIpkZUalKpVBEkAFAzaNHHtuu8zj88nfLyFef0mOPDS4FPJucQknrfWoAMGe0HM98e7rGUoRUoZ0z4Vi319usqaz7jrBs0QASmdzfUbggylVXKz30mmdE1WWeoFF3U19d+vk6\/qe57uO\/T1zHVWjRkd1GfrIHTU677zK7+ag7AZlj76Zmh2JxhSp3zMkxRkPxPzr+BM+dspyOs\/356DuDDZjjiO0yUnPPmw7Z4LUAyJ43mS9AAzgAd5a8\/SsXeSmedDn\/EQYiPDXrik5ciuzh98uFkZuBERQk+MN\/xcXc\/8NFS+wsaIAGAmdYHNgdIqoCV+IojjxBRTn5\/eoy+d26GhZZN5R8U1ErHdL+AcqSBNpNFADIIAE9nZ1MAAEChAAAAAAAAw61MQAQAAAApVZeXGv9C\/1P\/Tv9M\/0v\/V\/9K\/0r\/S\/9P\/1T\/Rv9W\/udM8F3WF2jeuFqCR+dsPrZ63WJ6EolLMvwBADBvzI0\/RoKHR8J9OIDZ+pmAzEJTqVHSUVKpVJEiAACwLw\/L75+P3ut7pShfws78SL2kLRIo8yP72ZeQA\/S7FiTfvNvzvkCmw2tLKERkV6utjffe1\/RqbYWSJ02PPngfYjPROQzAjHyhDUfK0mR+au6p\/73X3gBzujD0cM6jY84P6B7V5qBv7qnrvOD6Bj8gGU0mmXX7dDvnr7PdcddTX9QH3N6VppR\/VQKOj89SRyVgZvGv3zux+M4B3ZMGQ4xENp9dkEekQ1G3Px3X58CGzT6bWxY7vwkfJTUHh1N14H\/tKhMkG6D3jw+7DnCafUooA9q5b\/6VETK94ewHA+wChgGWkH+gjvSXCIBoDQGVuDiqdMKzAJ3QCUAAQbGJOQT8DEDfAUADHuhs6F3vL8CNK6rw56zwVeNPNE9cbcMvAADuE+KxJSgBy9oBQGYmNaKTEVGpVCpVSAEAwP5Ma7KjpGG3+TdhnJeLZD+p5s9jkxrdGCAsbC7vxGAZL0ogO+H8uvjgCQZFS+kBTsciUW3QI7IiOP1V594QzDu+XcXDWp6nPhQAAMD136zsbXiNwk\/a69X7GJ7ynl3+xGb3nJn+5L6UN\/uF2uxmesym66zto\/r+3pfiU6N9\/sBJ+jM1UNVnuKDOLw9Tz+6c+boptPeh\/qxO8qtxQM5\/YuL4LME59dmb\/dl1FBFXfZRdlUqucJI\/R1nbB\/9QGRdyIzKfDT+GFAAbLvhYxJfODmLi75w9D+6AdT4Gv1CABZy+118vKoHC6l+BC85+OPO+Fpxi4eC\/9TP\/21J\/3mnBBZYDx9QL4F4esYAfh9Pt4vRjGc56SgBcwwB8AIEAEACe6JzFY4s39CV5EvpKGxadq74\/9YY+JTeRuNUO\/AMAAADMK8Aapiyy\/gGQdEZRRtSIjqgRlaoQAgCAsT8AcAkYnNN2udcvAYrPQCYE5N\/J1ddd7giNIy4FKBS8FAGxftPgFNeQe01ak1hN2KFDrjrwvMeenB1l7VyeKuz+doeB7JYL7Wxu0UDtZFfWJDSqp5LNP66Us8CQCclP83kyd5Wf\/\/C9svO91VlbdJXcFAMzbD30Zqrq5IHzjRpgs+fQHxfVCbxaY0b3kNxnUYP2p7YV+F\/EdwKQOa09\/eGQ7ENS3Cr2KbER9WNkVBbQ4YPFUk6s\/9Sd8VP8cFJ\/GKoAOM03jvnuG46ivpp\/HxoRADDwN5SAZJdch8bsH9SfhxNrgeLcO\/nPXt4\/M7T\/vQ2wAfiQAMxwaJ2XGFwV8GMBQNBroZcXgGPDViQQBByGzQF+6BzFa+tv6BpvIryshT\/njG9b3wPFxrW84Q8AAPBNREp8LN65bABWA1jDMbFkJjWjpFKpVCqVpqoIAACMX+C91\/IysTHHzNIT5IwvUwCE2vuAtChK8IWuw4MPS\/NO5N07hQx2NSxqZeOjx5f7vnEnB1MZlXX\/6E3nngUU9lsz4N\/pfpmTnXPYVXLm3fV68uTXnH1AJzfni7mbdx\/Ov\/Ic7t29n8y+xsB5O6ELgA09HGof9q78Jx8WB88+Tj+f93+nmGROpp0fHiZ3iTTd+1ElAvZmA\/TgF7scw0hE3zNTp\/f5nxHkATTV+9S++Djj7UHCD6Tfn8gffizm430o6VMPPRKOPHwmnCmU5gN+KCVX507w8xV1Oo1x1N9bCA+o1tnjfHxI6A1IAviRF7ilX4pv4jSnAJjj9EEVck5QARg2OJpuzBbAEjBpADQAfugc6WtbT+glT8Je2aoj0XmF16cvR3KIMGsMfwAAYO7y314fOLPZLBuZNJ0RlUqlUlUhAADo5yOoCP7MMfQ1KTLQtiliIKoOjSr7dpa+8JfPvbwshp7p86+slJx9My9admeiCHov\/cfqR\/983pQ1+i4L+Kd\/6XNpExTUKMWsxmvb6rCZ6XRYPM2bZD6fk+31cL7\/OX0Z4DHZrv11zuye\/cXU1OTAt0+37zeGPfhinA8Ht1l7Tpmbe0N9qgHIA3mGf3ZX713nYpvyPmCzv7pt7eKYbnYdcFS8QbpzH5Av85Yn5346OjXTBgm+A0rtX53N3uyCAV+5x1I9nwTt2jDMF4j6WR9\/vZfB+nA8MuvA8b0mH3GYXxk+gaMjC+pyFB04xlA\/DD5+wOATtwXQgk58OIVZFS5OWjspICIZKhbbGZ+NAnhgmkLDVWELvug89OOau+tlmwjv2BUWnTexffsd+pJsIhFnIfgHAAAAeKgUOZaAdThiycweZZTUiEqlUqmqAADg8hIAXwMI8pv8dZe+Xh6Xgv8yKx\/avJehSPEevPeZba+p0Yz5kgF+YzsRQ0fP7CIo3aEd4YStK++QcbftgG2mAACAzy95O2Dc5twKGeWa0xi281c0J+\/f1GTNKJNTXbtu+OeeM3NNZe7PvSFrT07m6NfALk5x6P31fde1q+ZQnRzU5Ly1eSmM8bi\/jj8x9t5f9eeXLfCnt79O9fTQsHci5+LNdyGno4Kwqd6fbW3+HNF09aVzSEhmb77Bqe9sgI2deJYDzj4U+Q2AMXAaDuIb+xz7wYmrh\/xlyvcte2QX\/m2yeU03YEe5Cqd6zLvY4biWkUnN1doJ8LBYiuE3ADg+LCQAdR4AYQkk0gCA62QFUAUC+NRoFoA7AhSBZgABnug82GWfbyA5hJ99gEbn7m5PfKGO7RDpl\/xl\/gAAAHH6zWo0zM8HLOsnBGRGmRGdSVOpVCpVkQAA4KPDg18+fCv26TvY\/uR0Mm7TQGih8DtQWgIBOloPAK25Nlus76rf+8axYWY8nfy\/uZNnyP0fGabez7\/+8\/9rqalhBkgAgLNCzaGiAjPXnV2H\/fava9PFKTLzyQYe+LC7qzjur49ys2\/35Fe2+VV2Vu09dPNvvvJfiudRUzbb4vA\/X8DQldSu7BxxOFR+iW\/7mEQ3+7Qav4ISw3Zlcej6TmESwLmPn8PIIhV+bvwxoN9hs9lKGL7kbokBaUPBQT\/mNtCwk+Kc+YJNPqi1DQyIMUgkQCYAm7wBUfWY7pCSsxda\/6BxXAY\/0CZl+v44+IzBIXGhP\/AVNPA\/CMDWa0A7aywAlsQ1IqpuCyW44oZmgAze6Lz42xknLIonEUdJWHRu9e2KE3JrvkmkosnwQQO2f1RuOkyJD\/Y3KwGyAqzDASy5RJ0aUTOiSlOpFKgQAODbMfNUbvPNW0obYIc\/p6wXbiG0uj9uexoAMtXrrbb4dtKOKR3BA2T1\/thDbd6RAppuKAogw\/dvemlkAIB5T5MATJ7hzyeH09bbXz37k72L+dQ0uYuecZn1FKaSIVXq\/vP71+fTeXbXOXmYGZpnyOK12892sxP+83gf52beB\/Tm7Gvvcw6nYNjv\/qtrfNHFTP\/wpTj6z\/ypBk6TIxtdWBsvZmwd2DG+\/qOg2JmA4YB\/eaABHvThFPZBOk0D3yD\/kxshA5ycm\/4qCX1ZaMLV5dfIPvbbeTLuN0tNvHbKbRKY7vO12Z9+VAd\/htNyAFVqbiIJB\/852C7v0N9fABDcNmz6VRgaCBUAjABkAJ7o3LrrFXvqW\/AkwqwJFp2nu\/7iDovmmUSiS\/bCBxoM46tTAt4SNzVYgxfrPyB7ZkTNjCJqRKVSIRECAII+9my\/RL6dpwTJef3lc+ECxuGHEB7u\/AMhQIZrMoTirtU7d6n0Im+zVb4l4Du80s9P\/K9FHuf6frZoDRosADXAnGKAPV8pvm3o50NS81J1Np5zJwdOzcs2\/945pu2+pxh6n\/nalWLvTXaBeedfALCLt\/M4+crdS5FzsQE40Js5md+qNjuHrw+fw4Fuwc8uPPRfN\/MLx49hcp1mV7tqtM2kpmF\/NcAHOMlR\/djkjRim9hlG6LP5AwUb2OY3qTRsOHD9JC7UcBQjMIDmQU7oU+F\/e3+mxqlTRZuu+TCjRW7AA\/T0h8Y3ECsB6vu05cNL12ErBsQihMYhjZqzXwAtBw5Wp+MnoEGwjyUg5AQIAP7ovNT7p56wKJ5EtqtJsOjc+tvP77Ao3kR8VQh8QEOfH17cewPOLPHYAjwrwBoslsyMkko3aGpSaSoVQUgAgB9+UPf0NncBna9S53Z2O9tmAm23tz8\/L6UEBRi23UX0Qgitb32hACGXrM7ni\/f7GgosAN7VaLcB5txmcqEMb1K5q5usop3jGdMj4OvJ3\/7Wv8m65uRveGpnq2quhFInEcwhafpfdE59Y1MPgD7DrnefzBqa7nP9szl839XX2Z3sz9rzw1cdEubQH4APOv4SJDTwi\/neSbk3+CRf8EfeTg5S+Vl09t+4NUDDF2TvSiX3msbtzh5fhtVGfOow6ry+WsfPf3s22ByOPjPFamps4sOx+GqO0xv42pMAStALcAAAwEko9Z30GOPhBzr9QB1FOes3Z2YASBc8mMilCcJhSYXT+AAYR8EAbaiGttUBpgGe6Nzj\/e5P6Mb0JcKrs7DovLrtV++wtORJqJkJ\/gEAAAAeNzieCVjD88KSvUSZEZWOqFQqlYpECAAAxCMArgA5TM\/ff6SaoQBPtwfVOPuukHMbChkgK5ez4ycrePEQusnOjE+z3TPX6RnMO3YYIqYH6n+FsaAdhsYAMF311pgC0Cill0yfD1mJzqYge5\/TlO7+z65w9kNm\/U\/irCt9+B6mu\/HJqWv6+072zKESwByg6POrnfy99+0+1vN222D3UKfg7WbbQNvqzzoZVfWn6vSFG2YDuPh8aNr7nP39lCwQ0\/9i1D55awA+bupgUmnkx3Kv\/107or86oxxH2jjxXThtHCJ1dtp9fMDesw+foTobj3\/Ahr62VXsHzlk0NYtawl3gcl39x+n\/j4AB\/y6wSQL5OSs5nJzwoA5YAQQ98cEwgBR8FIyXCvD8WCgdG8gEZiiIWQHe6LzE2\/3sIZfkSWRenQ+Nzmu63nUPTE8icTU1fGE16KbuTaBrPv4PYH4eYFk\/CIgyotI0HUU0lUqlqiIAYCbbgieS\/mWmp+wPP598UtVbNLrtOJScFoIPaOJGDl0hFCD7Tvq09c\/aK+eltNZo+WdKaaW1\/Zhvv6bWMm0KAACAiB52f7mpbvZUVavOS97few8b2tk\/Ndk+c76YzZ6TcFNfhn8Oqfn7vmv\/+vRkyxR3P39FOR0+ol96TjdYDgfjuw9+AMd3zr1JzRsgEWVsFHx3rONndfQ7GjZnqlqcx862HGrYrU048LaM9yQAQFGY7xvXQPu7iXtrVPWjgQ3EZ8fV2lTrhEmC3gZIXwBuGqfPOJErXes04BM1Y\/07YaD9mZ+W00cJ7M8CEMBwKurF3Qr\/AYAAiua2kGEjJLtvotBmAANAowYAHul81e2\/plsNk8juIrRSFp2XernHHUg2EV\/phi\/6arB3zWcMoP\/PgwE+8DcdoFeANXgklqhnZiMziqhUKpWqSABA\/+nJr2twt+fKBxH5115N9gqTJG9YnaXlIfzGBS1ei\/et95opOYcud373b7hV3+Ui7DXA8zfHN1OfKQ3I80z21At64CRfNTvZXT1kDf8tn\/rHrtfrlsd933OeM86c+9\/u3t377NoYvn2mhycLyFFfys8uMukGTnFNMtTZcxpgH\/Jiswd25z7At\/E5GhVNnvMTMnU2IL7P2191m\/fbnHZ19if59VFo8iTUseb7gQ9T3sAX\/bWHXbA5m\/1FAXzIITdMCkn7Ox\/2yaY4cA\/7kjleYfwC0LCLrXG6OycuGCdlNBpYSsEdiIU1yy4FbMA4APxHzrlP9NeEn5ymcAFA8OP4J7XYg7faIZmBAJDZu1oyA2yawQFPZ2dTAABA1QAAAAAAAMOtTEAFAAAAGm8IaRr\/Tf9O\/0n\/RP8+\/0\/\/R\/9G\/0j\/WP9E\/0v\/Td7o\/O0mCbVCJ0KkZ41h0Xmr22\/tKScOEd6WDV80S9fti4cNNI0vvnsD3NxgWTKTjjKi0lQqlRpRkRACAPx38\/cLt62Y+JnQuv3vnnVYIYyj\/+qEifZD8IWyqrvntqZ3yjTNFCBDid51\/d+bcp7WnaQHAIbO5zVt6h1aXrepmFz5bvZ8smTm9EJr12aoU+J80X98eudmJnnPlbRIPnWQ9OmNd1MPczY8VP876ZOH8czJ03v+CaXhp3HY\/c\/Pn3+dzW99muZ9sh+q58hHvXlN1Onne2edPvwAHHhHwhi\/fG1IgNxbhvNtbJ6Cc2rYmvHxfXISxtl2R77CURgOkejVmWOweUxnsXtMWnJ31kH1DuIIH07XMUNZfvOZRcCPEwaUWn47hARrHTjhFE6EhXcGZeAzCQYSmqofknotDPKyV3GgcapIbGyzAtjwAZAVvuh8m\/03W6KziTA1LDov9XJvdzKCJxFfoQ9fYNtr\/8hnN+aAw9+yAQ\/fgQowWzIzM6JSI2pEU6lUhRAAkH\/y0ZpkrOvUJqM+r+3EF7yUtNlYG9pQ3++VAAwZk6mOrLtQNAMFcra+u\/X6L7roBQZvqN\/9oLnAOZ2Sc878DofqanKOYbJ+OecXf87wFPPck83pM79kd7oTFafnU7k7+zf12+ecU2I4WWRe3uyThmdXf2ru4t8zHEr+aqrI3l1NAcV+3FzdTW6APIcPAOyhEeztn6UN\/nESSMY6Pv\/8+3FyWjj9xbmPf3GrF6L+GN39W\/0\/R18QKeFk5N54U2a+YGOnj6ttseM1OC7sMbydcSBhg6T+AtAI+\/HvKxwlVij7P\/VjAH45B6qS\/\/xNfGu1Pj6s4deLDjSZMYejQOFD4qHk4QcAGNBsIgEEmuA7H3AA3uj8iPuvmmOYRHpmDpHOV9tK6rtbdrGJuAMOfJBzUnj5\/efAJ5i3AGtQopGZmVFGVGpSqbCiqgIAtJ399CFGjXmTg+Zoc379brzNRdwbPzR3MC6+BEoGSgi+zaO+egyFCRzdM\/3N9nluZQLyS+qLnWIsen53cBzjbB3ETFWWfZuvLCY5nOw9X8Xwr+Hkn6fOPtMPRR4qv6oed26m0OSZ7DlblZsmws3ZUM\/H5L\/Z7P2NYrS\/6myy95kq7Uqg7ybv3rXZtWegewMU9csD2JD5mfccBoqNx3EUJ4eT9LX\/Vs6RD4CkRl+dnD0fABAHzPlRwls6OLcZzvadnIT\/+fihawAcd8KVP3Sq57CtAgA2CfAezR8AoAU7Z6CHV05gG1XidP5IBsJWcuYAHkiG6j+ydLSDlQpyuFABAM5PEsoNrNQChIzSyEAOAN7ovPft31eoikMkru8W8ei8lpuE5w4Eh8i8\/lb4AwAAjbd\/7U9gfgLAbP0CRJkZZVIjKpVKpVIVCQAA5gMVqPo113gDsL1f2lny6nalo4McO7\/zQCGDz1kAd84dxmrDsrsnZDrZcNdfjt0id6AXgDK1XI2fg6kxHj9YAGwzUPvQv01zrmFPs2dDzrS1GRxxTLrr9zvslzu7hW6uLopKeH77mtMUVH82xc6Z3PC5z8lsPjubnqvqQ3P49X6y2ex9ce\/DHmAXXfA1HOWEcvxUSyLgegEoOW8SLBhvalOcm5cDRxrzTyD5qgK6E+p+QPf8zcGmgWEOzJ8EOIlifaD5+cg4gv+1BBCRZfXzp6K81M7CB6rB7CKKwBWSa0qZ9Dj9qD4gHP8+QGvFspokdMZvKv+VALD4kAZoFhoEspPPbHJQIGMAXun8aFvJ64ROdqLIdrkFk85Hu0pZd+gUh8juij98Meaw8u9\/vEyg8Xve7xJuxxOC2foLyKj0iEqNkqZGVKoiBQBoe4lXnbPXxkPQnv6w4vMKFI4OGvo7AAH5vvz8JAMAdMH7vf96XqNxSV\/QG0AG+PP3\/PFiyg00ADDpzJmBmXsaDEPSOezxD86Guqgcqsnpd\/+Lyrn\/DZWIvfrPr5xNX703h0NNnengNh4\/hjMnt1P+nXf4vD+VVx7OydI0+9SPnEPRLzaW2UdHaNDxaC0nDsB33+fknX98keiFXp2Mzfys6H04\/PfBQGCdKCULACZ3JXwNF1BQbfEhRyL5+QE2RQMlmC++t5YPx1I49AILoLtIQNqUGRoe342RZKJ11IG2VBfBI62EFKZjFYnj4ABcj6ML2+buAOzcYDuUDwD+6HyUrbTnDp1gE4krtEJEOj\/qLmmtsMjeRLYrFnyBPd8ebz5dAvhvpxa4eQRYhwLWTweIMqPMiEpTk0oBlaoKAPhTmk\/F7oytBV+BOnmanmbALzpfHC8kTApd8OMlXzJIPmtagEnuwnuTD9AVoKOlvfdhy7O2MZqBBlRDAgD3OQ1f9fRXJSdr11sHquvrqqthfN\/x52f6Ld+m4fN1yH9n7up76E0iPFXsOqPIH873\/MOP481XSVkA75f2\/ZvqniK30+PjA6Dn2qeXoX7lEvLkvyDPZmcjT2u+PzecDYbN3qfzRxUA\/3NT35t0fjjX6T9uDeGqiMFBhxT5eTi0cGrLnbxHP5xKAxs+tQFk\/lewuv+u7yBQ0AlF0vuGvfvjgg0AUMcbwIL9ACerIyWwwFHYAiD52BlwzF24LwIADQgATG6iDgUI4A7B0eZAH3AAPun8aauU1kJ\/M4nsoiOodP6eF8lRoZ9ZI\/Iha4IvFnMyT77TAf2LN8cF5g8B1qHEkpl0Jk2lUqlUKpUKKQQAhBPD0ZxvMxgbdoaX79xcGyIw+nTp+67XB19Ki6cU8JPwwsqUtODPPB7VN6nWU73nKW83mTQAFKzj+te9TVDoDZh3wkXRGx\/4U\/pfZ8bze\/qfew4NuwYOOl81VMPASfM75yv\/+ekE+LfoDcxL5wHucz7ZSdIMswecHB95Z7eqd9G7hq\/86sPsM71n33+Y\/IIv5cA5HPa0SXLbnN+2yUkDAxSSf6TDYH4s7IaGL5LftoD+z0\/xn+MKGmS97NcqjTIhfj7+M5jvBaXh5Dk++s5+4lN1\/KA\/PMy+luUPw9+PIkctIIDqwHzcD2mDX9Hg4QOovl5wFUgWYKoHKmIBg2yQRgBuCMChAR5e6fycTim1QlemQWR3y9QQ6fyYDqnRQuc2i8i8DIEvFg1b9ZsrAB9rBzDvDFiDGkvSGTWomTSVpkAqFSkEAHD0veWvJ3faQUIgrB63+0MGP7eAX\/Z479tM8JQcioT+JB6NL\/uBUqZUkP6PHecGgKi6BoCzU9QXuRQy0Ns855\/KrmtuyPkic\/bMaGpP\/zc5B\/aVDExD6+endfxOTcG\/9IGTa88vZ\/qaA7XkvJMv+cF1JedsOABzoHufKn\/46Fh3H46Pdft8\/+8B9ynlTH5K2fjDUjvnvlNejixsi53VAwN4pnz0PXvvfSWgffg60JvDzJnKJ5s5jNnW1COwsjpxBPVDDoA2iLmHC6S\/h+9dInHeKQeE4R51urXhME2Subf51IEfis2NaeoxVah7b7n8dGJHgmrCtghQ5ZyPKpEmYEBLaEWgALAGPul8rFcZfQ9XG55E+ptSMOn8Wg5p1UPfii+RmQngA4ylx+v9fYBt4+b0cGzMenaapmlqRKVSqVSqECQAwPR1OWvudzmv6ZhQopXXQ4536bLvfJdJ7x00lAIZ\/73bF0rJUCCX3vLk5PXSPP\/3eM7O+LKDCum82pKBDG0qPedj7cHmTibf5\/3uNupxfnocqb9\/2df\/sGcyofd0f\/LKKe\/Kw8sn8cxAZ\/Vu+PlJbhzjdvuoAM4MeQZGw\/Fv\/O6s98nNF3RW0RuMcF7cKK7DPuzvNACDn+sM939gfkmSOSgzyY8knH7\/APmNhmJgqr7KRx+GinUKhG1IAKoYkv5BQyELOicdfNTNLN2PTn8v9xbKUmRF6OQ6ALmWrtXA\/VN\/\/j\/5VAdDgYEyG7eMYDgnZniOayecKoADPvEg7jfh+VA4wAdQH6EIZOoAXun8uJ1SxJ16zSSyXUQrzKTzZ1mkzRkWQSOytTL8AgDwdzhwcxqY7czes9BRoVKpVCoFIiEAABD36GvBfXs7+UjdZW3BUx3eNky6lgBwC1TDWDSZO2zil3jNK7q2dHA0t9IBci\/MFFBfP\/29h3l\/n5ZAAzXmmgAAYH\/ifr\/bc8\/Nj\/nvDdCnC3L3nV9dWcUcfpz6Yu+d08euR2e+sdnVGCWgB7Pgdh9nTOP++ss5dU7nXb0kzM46r2Pev546w9u+OYeszT+\/ftO0yf90ieRHV25gDyDmvzmcz8fM4ez\/mTyu+Z8cn+vuz7vveTj4+cwHgqsPgNiHwUPRVO9OXi8nJ3sHKzcDh5oDn2Iy8otxjul2nOA4388S4nPbgXE6en8d5ujv\/sfuY917eziBAnhh+Dc4\/frgg6SPOWkNCAn8WdJAyTg+46B+tFYL2hGaA4UswLYluBQgAD7p\/DUvMleFTraJzMwElc6f8ZAxm6uaRmS7iCpcYa7vgHl8\/O6RhZsXzHp2OjOiUiMqlRpRqaoAAN3JTq4\/vWut2nD98hm\/u+W3Sq0oOX9ELywFyWQK7+kvHnJOL8A6g+md3rS58z\/js14oEieluOvb\/\/47ODGmMfY3snIqTzN9904PdL+9T\/\/+Z\/Z5+50NTFbRd+Z9Y\/88JnyHuTrzZG6oJ9hrOvbr2wZ29bh438o\/xebbTLHPDFk332724VQnxe40\/W1TVO\/DFNTJH0BC8tkcAPgrfds6gXcCR8Th+PP2zhSPkAaOKGj76\/xPB6mqmiSepKk6bqXhB0h0NDFa3q\/8cagKH3\/AfLyBr0kulaT4sCyoe+C79gDYGAag8nwBWuofAO++OnslOjlyICANJEREgPro5ES\/wTAAGMhAtjZsgMAGPun8XHZp+woEh8i84oVJ5+Z9kuqEbjeIbHFEDH7AHMv+260BAMC8BCwLnVEsoqOkUqlUKpUqpAAA88hch5BbUgW4BBzb7ezsdBPx7aQNhSDskIiqrlejKYRRjlzaV\/c\/Woe1Pk303FopQiUP\/PrOpgPTAEkl1cm99xd5dmmF0vLkufD1ADRd3zMPx2r7z4d4AqebU12Te24AfjScPfVLGl56Kjub0zvHm0MVL0lv32GQmlSYrJ3Zw6FX9U3J0zTl6b17muAd9uzEAHLdJUQe4M93thPLaw4DUh+uPwyAB2BLXP8+LH9SmTnT1vztpqH2Zu+QzZcGNCOSxjxecfwrX2FtsXqM+t9Xpz\/LyckppQG26I3T0TQavvKBl7Au8HOB6knhTn8VpvcxBLqJB4EDpAZy22DxMzE\/WuGVRHoDJrBTW6EBAcwxCwYAXun82g\/p9wxVsYlsxxUqnb+WXdrsrp8MItvtuMIPAPrfJjsAAKexZGZSo4wiKpVKpVJVBAAQcwyPlLEhA4gHQJSLyMKn1+49YU4MOGUxXV0KD\/uCPp\/T9l9vO0UvME85T3Tc9u0Yf734tF8X3+fAWIDGn7\/eAmidedwaPfPdk1l5mK9dz\/fjZu+qHubQRe9zsDVOvu+8r703Z3cCG3bt50xr4PRm8Ol\/rQPk3nt29Vef32yu2bvonXP\/vvqX5+xiF\/86+xwA9vz5\/79O5uOz6o8f40T98Q2niq0mq85yMhr+Q2wOQDVzfy\/b2nU+uyABkg3DDtkp5X84fVTrIAES\/Q\/jvnii5fdO1rGoX3\/4KODQLD60fFMVWBxjwK1ipZY89xc4kA7+7Q65v5CU2Dm4HjQAkBc41XshsfDATAMfHnA6BmSUewbcngYHFAFPZ2dTAABACQEAAAAAAMOtTEAGAAAAQ98Y6xr\/Tf88\/0L\/Rv9C\/0b\/QP9H\/1T\/Qf9A\/0T\/QV7p\/FkX2WcGIXoS6XFSoNL5vR+yewv9GCaRfpPJMlf43NUhgK\/\/79g0nGW9CMhORxEdUalUKjWKqEghAIDc6x3Wf3fvn7n8Lx4feLGddIR6PgybvhSCpxBoYZw3H9ab21ubgwk6j\/6n22FpvU9lDZQ5d0rP4\/Zx5BKF3MqfKYABAHYfjlpwmvN2Mod9BlfXc7urO0dVnHq69m0w6\/wMn88Ptk59ePbdB4D8a+eM\/3FyTHG+pruBs\/M9Q\/6\/N\/R1cgp9b1mpnRYzVU9i2oXS\/hirgq\/JGIfDCQZfbg7ffzQwpY\/rTErA4Odh+Gn1PudfB2ccztgPJ4cDT0MNXZ0+cdRjX7XDGsI5R0XjoVo7a0n402cEG8vHoOrOLVPqkFj8ZAudYQDYu5LNyfOR4P2GhADAT80AguA\/gKyY9A8Ani0\/gzbIjGCcktxAFyAAXun8XncZ1UPXjk1k3lICk86\/5yytCLVEiMwSfID50PjbtwP8H3DKrCQ1SiqdVJpKpVKpQgoAsL\/djSYSkhKkBFa0JouW7IOP3PYPtr6Z6znPM5lv3f+DG7Q25TYzLoV9sln\/UbiKKfb9Nibucxz889PbBWCGKXc4u06K16NvsumEGcPzMm\/\/Htz22Gq78z7n4aXobwPNgfNvCebP4fXaHyBiymM597KfB5uieBuglZWvxvd\/nGDjndrD2T+9MDAlfgfYw+3g9FmZT2Ye8SOWocKP45aNxJ6vTtg7NwD4\/IAp4ACAPhzA02X2+MQPCwgDTD4oeCw\/XdSU+tA43Q8uVY25hI+vw+Fv547bD9SH\/1dw1vGdsxKyHIAMf2h97+Ym4QLIBJ2cV1T1A22gDQnZOgfAmUCmn4GjAcgAPun8O8+ynVDHgEiPIwCYdH5eD6m9hygZRLbjD180oPGvoycg9l8WmjluKjBbrwFRJp3UiEGNqFQqlaoiBIBHX5Wb3NMRKhR5hr5TezvgcwiPjW1ue6HzHd75hctZgBJyAALd\/\/nIbVopdPe5mT73Rp\/XqY++OZMzFMFymYRCQ50Ph\/qkMndl7g3yd99POlT1A3BO5Qb4KhWQkJV9QWbCATKpPRtd5OdDWU7wHHg8avMvzD6QX8AGAMic+roPQJ7MIwDu\/mIneJw7SJAmJUr1UH8A4LAPnUr91H\/9xT8jP8iD43ajnvftZO9i59fcEUI5\/bvwMxgG7zN9+B+2dqreeSfnnAZf9fVSOyVOhFj3Q8JRxsc\/lqPENZz4zyAQtQ9OzjpZAP7J1fk0JAjqus4ScYDiI9BgALZmdgOAEFgDYiAAPun8da6yqoWqKXKkX4bFudL567bK9BY6TSKyu8waPsBmr19\/\/wE4A2fWaTqjpNJJU6l0RKUqQgAAeB+NkfznDAFfgtvTi9EGdu+WvWdajB\/57QeTCzD7p5Xr+50Jz+QCDTWgXU5Lf1ryBrL5+XCAdXwsH9n2cb+VqJn\/np2f0X7mHFpGHcfxA72Hnnky4WzHBx84jOJvzs9umiyOv4b7W9eceMSw8wsSZoOzzjm7Mua72l2f4mDXoP730frKzaZPX39sGPiKPse62P\/94\/yvfKiTiH1zdOpFfpyRX7WT6XQ0Dd+qxkWd3kBvNpL4AGMNBfuH\/Ae84OuMwrFiU0XVFnMuCz7s+gfMftOx9OnX5zEcF4re9jwJqnW+zoBOigaAV5w6CQeAhNfk\/wPUkjCo0AIABgAzeOuj4gdgVwPADPSqAzLaAD7p\/OelS1dCnREiMxoCk85\/nk2aEroWIDJT4AME8m+tK6BsuA04Lms\/IKmZjCijBpVKpUZUCEECACyNPxdb39hKup5kww8uL68phdJOGSPbyixM0FCkqT\/caiDvjLuWrvjy7Qe9MD1wJ7cCABMcMCzpuTDNlUBW7Wsz4\/qpu2nn9X+nqWtg+DpcZ6qKOc6v8aki2R\/fOSZ\/W23Vaa8+MHpbN7sAph6dzZz+9TWcpo6Gq4D6LQAUnAYymSp49w7e\/6uwe4D8dzu3fZxxY7Rk9oF+e1NW9yub\/2CfKXad3MCVhh597VQ65yiR+DJiADYeXXwsghHYr6c+x18ydVwnh8Ote6f\/XhowHLNFWTEOp+G0w5Gpu62Gn5YJyMAAVOcGWABaOGmjBIvtbD3Q1AE8ADgAwwIDEYmQyMYMDQaycxhRAD7p3Pw6yRa4fjaIVGYMlc5ft1lWzNDZGpFq3fAFum5\/97TNgfFNCnD6kpk9Izqp1IhKpVJVAQAm0Yb+VmtjnQA+Z+9qdULxN3p8\/z8G3zCfl9LJH\/5x3srk3HJh7hPl063sy\/nx\/brbD\/c7J\/kCKAao1H\/RyTk3mMtU8icpqqohu5lquGEz5zBsmrvZAGSePkndyWR+UZxTX2eAaXon51BAvuQ5WXlubej6cADI7TbvbMxz5hcz9VUD56urC2AXCXt3949Nwhd+OMChks8mu04eF8PAGznv+PPh\/yv96kjCgmZ+AvYGAXX2V8u4KAAYSPr8kt0VfO2ozK\/15wMqCvafYMZsofffdvUSMLAboPdHzyuU+fhhD1K3vPpK0SlRP5r8KuHnAwDE03DMzGFsrRdgoHLBDwCEos5lgKNh580GwOUAcAQ+6dx8O8kITwyI9NYNk86f7SqrVehG04j0W0INHwBW5d0E\/yc4jSXKTDrpiEqNqFQqVRUAgNDTs3KNg7N8Ca0Pvfbz1PG0H0qAjb\/9YPBtcpnH5L41LFrP7M8qUwcx3e\/bma+PV0+XszdN5bAv9uvwHXMGmE2fy9zZnZPV9Kn8SvYfssncFwUOJ6yx\/Z1g+vymSvTdmcxOphOa4rq2c3Lczvw2ZwM9nTOczT5\/NnPD9IZqgO9jfvRmN3Ha6li7n6O1kyNozO9gyAN8A9+mTsPBEvyL7WPtM0\/j6x0GyD2HLOkZWtsedvHFoeKI7NtCEE4OQgsvhxbeC0g57\/a\/spxEBOe+pF1HAH7h4AQC\/nu80r8NYH3qOQzI5WEATiiHE3Rc8FE0VpPC5He\/EvkhAT9AiLKHDSDAEKA1QgA2GwwAPuj8aV1KENZRQHQAJp0\/11V2tdCV4CZS0Q78AJrE\/Q9uAABOX6JMakYZ0VQqlUqlioQAAGD9WKS6YgDgChCF4FD385eJ0wnDiJzKW8HAxQ3r7bw08C\/vLrfL1MdlbsW0ztt+W+ftm9zG2WfUHIY\/e7rhXVJflZnc21TKZj1NBTbMFH3E8FUASXFnDfT9Ul\/fvms61WHDyexPJcmVbE5nF9xZNw1str++RDL7k1Nw8hyAo9VsLdXi8SGVE0cc53zPfTaigDnbtE9\/DkXBKRp35X+TEnT6IVJ2+WCGswFKf3\/VTus\/3bsBspLyF4f91hgS55zcYHPs4b1oHZH6u0PeJG6ZfTR8U+6aJciW3dyy9MUeDymUwo8G1lIJUPwBzFLq178\/DgDnAC6lFm\/GxQHc01eMYzjAOGUAKCeATd6CgQjN0YDsYgA+6dz8HGW0SMtMEJlxQIJJ5+\/rImtF6Ft0kkglwRf0aMzjUN0ATfuvHTizWZsZZSZNU6lUKpWqQgAAmX+a38M7+y\/K+\/L96XDA11qMv\/rN5eb2JN+e+7S4duef49JY7LMmk2lTFzlr2j7BzFSwZvdhTR2PPp1bp+xTKOznvOm4+9M6vtrzPjPnuA+pjK+Pi5mZ\/ec8J+eyONif2FN1+uTJD8xn1++4vqg83dC95Hsgh9MnJ+F0fuCwdyvV+\/f0V2lgYF4Tusw2\/0NvDp77HKGGKklCMsrvnNxc+2Dm8T5Ub9j1+Ps+AKA+9HEKQofAphNg8wU45+Fg2RzgA7sOewh54eSPtjjMcClhzM7RS3yUnZnubAXA30mA1o5cYO648Ie\/QiCt4A5nyWavh3Xg4MPpGDiJZBy6riSd\/jnBlYCDCgwnAIShiPPAYSDWAkAm4AVtbAA+6fxzmWW6hm4wifQBVDr\/3mfZUwM0IrXALwAANnBTgqhnJp0RlY5omkqlqgoAAKxAoEQhfvVpGG8J6pW2d+62oeBDL3gFbKaQZ8rU+nm3Gh7+ZWoFMlNZzFOn1NDkTHBl5lB8dK76475WxzBuY2wVyduuzKJ3MZe6PxzBrz5T5xxqrt\/8hg1fuzOrnl2n997z8czU4Vycb2ya2vSvuWd3ApD5VefF\/VzFULk3X1nPie5kKt31rTb8KRWwDww5nOfutDZQv12M9d+icu\/Tk8XZfLbMnDCbmhn14kerGU7\/OTkBDp\/gn2PO4WzOTvgqfE7uRH2Af5Fd\/WNiWuq+nA\/E904G2QPIAz86CmBzlTQcoJByfzvEoNG6QnWUtCp\/AD9ocCJQVp6S5wqPAw8LoLkgEvQQU010AxHdeAjOAWYDAj7p\/Hc7yeq4WiJEqgSVzj+3Wb5eQaIQ4QIfMO96uvXbC9w1TrREmZlUKpUaRVQqlSpSAADq9K17BdF8IPfIkWkM\/rV4KLncuP+n\/6ZQ+jztl9Mv3XNhKvubiVbK99PAPs9dw2HSm+8\/tmvv59YpZaZQmFsTH\/6GAyc3N9u99z57f8j9z8dYhk6dpkz1Ob0b76\/umSKp\/gG7kj1qpqeqMveZv9ibW4Auqtn7Q28nFzlw+Hb2Szb5Bw67zmenAdFQpHsnwPk6wNcfx7HkdNh9mH+fnXBYKL6d7vfmA4wvOpGTzsmaGacW\/zlWh4+vdyr+c\/CTTno9YEEOKJtz+l+9NaSe0zE4Lw3NBuztxL8aAfiwOHA4x58feT3X4z8OsouzOL0dWCcWeH91wyfxBgTMQAkFDpA4yMAZ9o0AwjZgMgY+6fz3OsrTSBKIOAQmnf88uzydoFWIOBFOV\/B3ogE3X8wDnKVnRjQdRRlRqdSkUhVCAABCGTJOTvMz4VvIX3Kd9ZwTPIRclIp55Kuz9aascwa+\/jONiVLOxpNpuWVyIau8KHYD0Y9mM5vaXL\/3P8oY04P77XHe1P5sZeafHqj7O9AMxZBwnjyfrDw9w9m\/+U\/uXRvIgn12wuGza+5N56kfeTabOsUMSj9R3FBDOX5+\/nv8+TTwRR0ANmPi0L5whYsaahrr8Mm\/wcVOwd46JMEHFAfQhdHv2LQZggB+Dj1fXey8RZ\/c5XPrB+zzDQAKYBdjv5RgGKfU+7DHnz\/O\/Vqrc4LwZ77\/GAA7GpYlPFy84X79oTqBo\/GPQ1EHuqn+xsmmPB8AQBvl6GQ+NJ9S\/gKQRIISGq5WODmDiRkg4MChVQcABl7p\/O86yttI\/QARg0rn\/1y7HBtJAxEHwxUFVw2wZscCJxtUOsrMjKIoolKpVCEIAQDkkH4t\/7hL59seyPL4nu9tT9rz16al7vmw3x5SxmdTL8kXDx62uc2dhSgtlzfnz0bL95qi+0lPH+qza84pfv1534Zjms4c\/1XWT3P378H\/H197idq5GqnNo7fCC9Rh5zlJJb9zKvveZ+p82DNVzZyfzi06NlpU3r2\/YCprk5UA7wzHdAO5OQeKr3PoRv5DqbA2LWt4piWmoY2G3BTMlzAAZ\/xjQ24kfptOmKGrgaEO1ObBaRV3Sw7wbw5DcebQm3H6+HByzPTHYb4uDpVKgC4UZw5g7MbcqgPk4ENckzfeU8UZ5chG6cPnfkrHnJPKgb\/gqqUAJ\/7\/49DUBq6B+ykZgNM\/A+BgY5HPAQEnYCAGT2dnUwAAQD0BAAAAAADDrUxABwAAAGHt5yAa\/0H\/Iv82\/z7\/R\/9L\/0n\/Qf9M\/zb\/N\/9H\/0M+6fzfzypXmFCBSAzBoPP7Osp24TQawAMmYLrjRNnGkhpRaSqVSlOpNFWFAABKMdrfs7u70e1L8eyDsNae3\/z1k5bsOxpf3\/XD0bqsL1speXHjX3KeJybBeHGe90tuhn32vsgZl067rztaTs+c69lUNUV+n3fGuZk5FCc3bu47j5\/+\/X73afS3\/ZZbn89KaWJeHKCaiw3uH41prj0l03KZ5kWpt6H2QPt0TWfC2Tok7D\/f6NhAc7\/\/uXX359CFXRvyMzDPb5uQu\/4zHHP6\/PGz1vFval0nJwPbWjwtB7ymhAXcWwC+CCiAkwM0mLv+w1H\/GeRnnNP4HObnv5UC6mnhP8MdR2Z\/McI0QO5OY5wk\/\/+AxRpZa1OeJSG4\/CyysHMfcI1nA5BfwAGjr\/gGfzlq6KASFzJpkOka9gc4HBBwAP7n\/Dqa9CAsADDp\/O\/VZCtBSxAJ8AFzLE9\/HOCtcNOAKDOTpjKoSVOpVKoqggAACPtFv\/Ll+KVEGsJ26dy4lam267eywjax2V3yXcjKZPzjizJ1Sl7npzRy6ZaY9q8XbpqC+x9OP3rzfuqrzuka4JzZOcwRNOea1jNJwiR7YOfMF7DZDMZF0ecpoPOcHs65YE6yEezZh\/b8qM2cncCQCJjipn60qGC9GZLqz0xTSfNYevb4\/YH5Jf3KYuFccbp67D3t25l3t18lSDDBiaiq\/AD2adghcwDIDd8oik0j8DNoLqCYG4Cshg8HAmavj\/pF46ytg\/QjPIADHJ+\/3Mq4\/5NKWac\/oOpa5WYCK6jFn89OulEWgToZCAYwgMvAlgYgjgBe6fz3MckzNfWFRsRg0vnvc5SrhHxAJMAHWCwfv93g\/Q4nMzMjmo6SSo1oqlQkJACAL12ywkm6k1e89kL\/8\/pwCWXrSj54Ovrbj3ktyH3enEe\/mTblPDfo5HZQHzg86Tlnn\/MqC4ZPbaY3H38jT04yffb3ZpNMb9gU5z3dUMMfhv1nzkOlbQZc+2vvr3lzmiR798O8bKAOAANn03\/+FJskPzM0s+eFmil6epIfh0x+R333M47Wxc6AbX6qBopbfB9cHIr8MQ4nRwYcXwb9ZUZMYZgUJ6u\/utrh9A9tIae4SQEJMCoBw\/hPgzT\/nBsO6yAnIv\/Bgn9WO90kP7T4eEqfGWoAaFrZ5\/IM0kkCn12AAviNOZyj\/AA\/\/yEIGkAM6LrtJRJfDVdbEAUnGrFAAMDpUCFnkwFe6fz3Pck9HqAQiRkmnf98dblB6AaIGHxAQyO+eDvAnTiZSWcURdQoolKpEVWRCAAAeVvfs+U6tSa+tGWgbZx+2eaiQaZbR09YVqZSV8\/b52flnlZL1voZF+tGo\/HZO71FcFO5d5N7eHKg6zDzYwru\/VRSs\/Fd6TNfRWfxP1nTlfzvNIcz53DYT\/qt\/Zv97djh\/cNHhw5vHza\/raoGOCcTcnK\/X8XsgSLvLnrwwD57Ts8LdGf9UF\/8zMrfSZ8fm3MacPcr3JIFkuTHl14+B4Rzn9ehKD8c9v58oj7Pii6gfk3GnCOoOZ+eGXyCc4TTbLDRme\/oHenHh5PjiKjO9gadlx7UD+H4gcSf3\/IofPDR\/cSp92MWYHVJlxAwyI9Pb4AN1FggKgFJ9us4HQ0AGOwDTHUg4MhADEEypjWABv7n\/LUt0kOmzgVApfO\/V5eze1AyRCqaAl8A9i+39gCM75\/nBC6eXOg9M0smTVOpSaVSqSIhAACCCUbKbO9OwlkVQrvi9uGHqlz4uH252p0ueOFkkv\/dc\/Rv4+\/dP34Mxpk+2+Ptrze3ie\/s7j7FvOd9qp7OcNxtW+57ss\/GVDa9iXKAJ8HxYTLp\/YM57HpG1Sdj6hGHm8m7+hnO3smh2cyZByCrgX8\/9b++qj\/5xQZgrq7yUFSqc7vduB3c7fHzUHNy9tn\/09TZBQfo7ZutjTu\/sQGm5JRv4BzqQALq69I\/8MG5+pz\/gW5qcsGPzjardkNu2B+osh4IkSSWIx86OcGVfD6ulwUNiOGQA6f3iz1wGxI1NMxgie\/RUD\/DK2\/vh+aH8YXK\/5x+1RcnAcJhWepnKAM3cCTAgO00ACL5JtPiP2gAbusGHuj8te0yBa4fEAXCIdD5vXe5hTOAYLiCjg3A1X\/vwLwAyJ6ZNE1HEZWm0lQqVRECAKC4U7PtZtPqcXsR\/mcN2XdnzaL52biUuxw6NLR3OVAOerk8m78636\/NL+aZ1LkP0\/DZ03WSUdN3DU3Vb\/rh\/29V+26zb3eH4fTT6e7ff+rDfydDf9jKzc5DMfthu\/O0m\/7qr4LpOU9DsampYdOHb5uTWQD7fOtBOTPM5CGHHwe+5+u\/odi1oeCaZLPtFygY8d\/mdAM6fPX5l2Bd6+z4gYF6dCR\/\/o03BXtgz\/fW3M+n8r8\/2P85uWH3HNrw0XA4hS0doZ9+9I\/5zI\/6UD\/7jw8UIve1DQcaPWz2\/Ge+ar4y12uc1o+hKB1qTIqceQtg84BgYyhlwyTjKz9fcbbxI\/gQABIh\/\/14kMkAgPmhoRhklL3jFcgAEQEAPun856vLDoIBIgECnZ\/nLGuqg4AFvkDQXf78BGzN+OYKOEtmZlKjiErNiKZSqaoAAJ75xYTaSSf5xLzzq3dlavm59kD\/euvjQel5tKlMv9D+0za5TznnMvep09f783l\/aUpjPBVNz655ff78WU94porNM0zSR9vz5n\/qIg\/Pw5lKaHYmXz++JhGcSQZ2594vJ3tDe+pfw5msXXTV9+ypc2XSmUDzCiA\/OQXn0NdseLo3TNXU7OrhMD47P1pbiGH8\/HzgXwDk+dqfJHM+Nk4dUWZ9x9Z87UP5wPHv6ft4nPL6\/NXpOyjJH5z4z0F1Xn+VHzh80j+gbAEk8PMpGNhFQVvoY8CmMAD9bzHTPx\/IBU6eWP2aNNDcvXfvsfM\/jHD9cTg54Zx3hhpWzv1UpDTEThRQdMIpNeE6kPCJx5ENXXAAKHjUARowBB7o\/L41GUowAHDo\/HVvcgZBAcLCFQp\/qWE3mvGNvbH3klQ6opOOqEmlqVQqVUUAAPSslf8b93aeVk+7Hvz+\/7stujtu9nm9f301uYy7jg7XB+eL0981t9e\/\/j73\/fnhvJ17L2XjvOh6Dso89TnnW56mr7137pnucvf5n9rNhjlnqNrT9e+zsbYzf1tOPx+PR9OJzg\/0bkybx\/T\/poazh9PAmbOHvpLuc4Cf5kfzz4859sEPoz\/nR8JmNgWUn5NZv5Rb9+YH8B8AcM6BP9epcHAw\/YE9zeGrgEkE58eW2ByhV+cO6fdTZAZ+cICTUrCSl5oD+8CG0xu+Vc0kB3BKtOWH0z+kex2BBwzaCYuBPeQ20L8U\/uCOIx9cDD24Pw6E1BrB3w9cB5hM\/mIAQPHhVGGBBZJsGXBRwAEKYACh9QANHuj8vEyywoNBAQh0fl+77MABgC8w7MbzyzUaG1t\/Mxi206PMzE7TETWi0lQaBqoAAITJNC+5P8WG2Wft5Qxtnij+nAU8fufWouan8zzvl8Nlv\/E83j9vObv5snefbvt+Hvs\/\/6gf49O+9+0ppjn1h\/YFA992nySvrjYdWq3PH62pejnPzqybP\/\/NPvudMzS5zzkcYE\/VL\/\/wdOXTmTMC4DTOrJlTPb85deBwtjur5k\/v6QGG9v4nyiHuizu\/1wGw\/9vFa26HneqzC\/TFARDpk8\/L4MSxZ\/MDH3ZBWoLlnOnAGfC+RXtgtLledrGpA2DaDrfTn\/QXTEs5WLVYHtQO6TP4MdsIKsPVVL\/ho315xE7XxfxcZUeSOF3wB3bWTpqemQ+aUVZs+LYQ5ERORo4B8aeTZB+acwFOxgCZ6LCRQKtiNltAMC1sMqijBF7p\/O97lKcIPRAhGHT+unZZjQAA3gB99z88WU72iKZmUqOkk0qlSlUkAAB+BRtMuOc\/obT9nnPkpIRHPuN5bts\/+sNX74uH7azc\/NDz\/uVxT4VbznlcX7dF\/V66cfMEZ1d58qp8v9jw79O73r4E+\/UBtjvJ+Sdd0ENt\/5nJZvhzMj+K8JYjMyensNP3X3S4c3\/Nnh7t3JWH\/ehof7bWUaqO8qs6vhzNk9NMd\/J1eiCp\/nSz\/1aahM\/eU18HgCa\/DoDgAMVfvgOG9H00HwBVoynaXzoSyvvDT2UAEPp2OBtg+w9Yezed26UcuJ1sjtvNlG84W1soBZS4UB6YXycA22z7E+CoGidGBeCmLIXhYwYORAW+\/oP0wcfPPxA+wkpCFPuBFPwkvMIZGe8gxAAQcDSTAQUHAH7o\/HXvchsBAAQ6v66jLCcAgAdHp9VQSNwUQYloahTRVJqOqFRqRIXFIhEAAMT4fxy8X1h+SlU6N4f8dSEDXU+KaLscfYzQTt3mDt8fnz+93Nfci59LVrvV+9BP\/t6zfp1+ut7XH18zbjfjbe8\/HEN\/9Yh0Qc7nFr+WZrX1l\/EJ6q1mv+z9bzN8Bs6ePaz\/rcb73YZjHTlSX1O1a+AAnR+86cD6ywHgex\/oOT37+PPjVA+OfMQeux8fcFz7y9\/aAuCH\/6uVn\/zA66NaAKfjb6dOP\/w3iZLDJNmpA\/tj0DGHApBGl9HgQ3kQczP54Tr9GOMJNp\/i+I8Cjj\/kIw4n1I+ApepPkvysFpjq4YfhFPkNfwoqBa0G5ov94Bje+R+gbZ3TTwMkjpFLGGCzyXUwrQNNbXYTGgAe6Px9K7KVYABg0Pn7XuUGAQDMFfyf4KYEGaMzo6QziqKkUiOqQhAA0\/pn3LXbDdur73TFa1hZ2vYXVn019VBWO819IPdw\/67+MRU9MSy1nWs56UuP+0uy8Py+mc5zpvePie51LhpNAjn5+brfs7s\/LJ+Lvd\/+Yc5lnpkbpObM\/LfGyYxd7jqPpB\/n\/Pjs3OVjvrp+88\/2v09veg5dDaeLuTthH74fpqGUdWBtRMbb6e9nU9kJ7KH0s4VD0tKbzckGSv+hTid8Noj\/lJOTTeBpxl9lAB2bfqiTsDecY0BsNvaPUe0C2Mzvao6KiA9Mpd4cADhGu4x6OH12fLkHyqd18i6YA1WxuTDMAdV89TSQkBu4yANfgqrYLLjIBcPa3C8eYDgBFCl4gAMIUKbgfxxY8QFYJ4SYfjg0s5wZdUMfMDgH0AwZAD7o\/Ll22U4wgCAIdH5\/NhmIBAngAX8FfyiUt8IT9MxMOsqko4gaUamwUiEAgCDrqy\/ZW9m5j9VCyP6t88brA71tF9Yfwu5qY\/l5uyVwmv1OWfnO+9s8Lvtz5nxuX+A8DNP4a98ixizN\/Ph6jvgXnTSbZ07tnWya7NkwnQP++uRvoMhr5xfZb53u5F9Zw87zBdRpBr421OaXMGTSMOf0v0nyqyl6V7GzOd9OsSGHO5oGflZxvud+dvU4iz1nTiH+5mBt+OA\/UrVm8wo+KmAo6eXQ9NBs5mw4KX2AGYpiz2mq8882x\/jzNzv6Uzmb28WGac55LJBk8IFV\/+MnGljcthHZ+s7ejlWBnz3w4ZRRvhnHcJQa3ECbApkD2QcYpy987yRYgEPDLXJy9i81oY5dBg4sDQD7lEIrANhkAxngqIAYhgBPZ2dTAABAcQEAAAAAAMOtTEAIAAAAY4wRkhr\/Nv87\/0T\/Qv9F\/z\/\/P\/8+\/0D\/Rv9L\/03\/QD7o\/Lk3WUpQgEAQ6Pz9qDKxwQDAFfxn0DCi949gNDeFX4Gkl6TpiEpTqVRqRKVSERIBAJD9UNWZ7fLeQl6mpd7Sd144PiTa8kvc34Gp4RP3u62XNf9e89MzzbTNZWcu3Qf8Hfd1ZbfGcS\/vF\/\/M0i8rG5E9vz6P7Mgs8s9Q552m9anl3sntaYZpAqLeMLnrMk0Xv8PAoe6vgdl1snbtht9+64Um9yX5tgc2SSZnw70ffAfZ2UPNteld7CL1+tzAARTmF36QvvX4DvlX4yQFoIR04DyilGwAeFTA+c\/5Wj8iBRmpjro+eOFUN4qfVWLfEKyVI9kfhgGnlDmdT4MfB9drJ8Zdh77+Uxs4UCTD9wBTRdUC0iew6oFrQGM7bh068gNEcAL4cAIEQvcHKtwYA4pD2CZsAB7o\/P7oMiAAgEDn96vLDAIAeDD+R8IFp0eZdNIRNaLSNJVKpSpCAAB0afs7Mms+5nEzZfxqcClqPmh4Oav9QYh+3WrrHf7yyXlauS0vgtLPb955kcrrcWubB3kzj92\/\/Fdz7z3sh8k7\/zBM1daeD\/uwi11nN8x6NdqdWhwVp+Gi2aK6T\/YGIPfALzfmU2zYACcv6J7prKKovf3+w2m1AHZlPWlmF3VgA\/Tp6XnIIt8nTwk4ezBF8zyFrcq9u7+xqQa+AU8BM2yD\/OC7rx989+X0PA8n536o3zn9JADm8CM3B0j3R3qURMH3zFCM\/1fJyc467FpN2wmDDUA18K2ygnJyrB8A6T4ApOZTvvvwwv75sLsPlPnBK4B\/zmTUCgA\/1EwYgxMAih+nryPAIiEMhhYzGwPACkJeaI4CHuj8enRZ6sEhgIhC5+93lxOSBoC5o5PQZiadSZeITiqVSqWqCsBd12sMSx8vPNn2VvzSRwvArYs\/JX30vzv3v\/5xfvr39vHQ+4\/ftsc\/6\/s+0p\/Tbk1fcauN23jSQdQ9++qss7\/PyhmmnJ0bv2RxoIb7T2XVTur0tykemKn2V0IdHiqh7qa\/ff1mn1NTXTnT2DnGxMk6s933v84cVORA9T4JDPVg0z4kT8LKf1IUdX7s0zXMADC1Abq4wo6\/6oef8bY1dQByzznFPvzrZ5IW5XbuuRX\/1uROf+rAyS34p9VlC\/+A\/33gUFH58KtEBhWdAxYwX7CBTPGtSG+fqcvpBxdkyH+r9uI0vn6\/NpujJIAP+OG\/5KzASf58ucd1yuuPQSeFU31rPH0LHwAFyU7wQyUoZHD4u9Ixmx8yKOAQbCBRAAU+6Pz1aLIEyQRAoPP9nGRpBY2EBR7gY7gexNmZmVRqRtSISqWpVIVEAACUqpdXIsv3wGb9lP7pJArd0868b9O92blu7l9+aG3cX2kl++bmLbgoE\/ttlPOD83Nu8ZT9dW4b2qZNHe5\/l\/sNx8Pr2baeTUJrd+\/TDWx6Tu68h02Va\/Jf+8DO+Vd6rt00uV3nJKf2VV21Kznne8Le7GSGR31VXv3WPofm9NlZ9PinqR9DY9bx86qOZLjlX2e7z\/XnY3z3Mz9ueJnZvcCMvwHI7D1MHTiUzvyBvck9Pzj\/m9\/WL13x2\/w4Wsn+y43QT24Z+3NxnnM2cGCSF\/Lfp2haDYpJHr+QTZKS\/sP8HPvyAZ8n31\/4\/HNLvitAszGALrFd7cNW+WqkAv\/hJYmWYgcXC77rOMCpPgVFMcAms40DdsvSBAB+6Pz97HIWAQAMOn+eXZYgmAC4gs+zQfdTX40112ZmRhFNR9SISqVSqVRVAACy1e5XJu8OS\/3td8wayerr3x+75\/zHw5+\/rd\/vz\/++PtwfO\/uVeTOkvphIPtzkxWJT+PU8h99sOGfvOW8+v07ncH60ctPzqwvge9fAoci4OTl1sf8vNH994+Rm51efHOjsorNd9\/n1C1SdpMm9z\/6aQ7r5szm7GDHXh\/5\/sP67l+87k2ZP7b67SfVB71huhv2uNJz4LNmc3gDluQYf7KUD\/kLtQ3KA\/W0fAJSvb82hvzmHF0N9v2aKjyS0qCpKuMEnonKzKwFO36fnj5BlN32SdJozbliC0SIpOlo+NBoiV4jvPv2wAYGKPysNGwe\/glAUvbO+dGz2gTj0P7GAZBnAOe8XnWaABYe+ADVsZsCCTcOs2QDQCAA+6Px5d1kQAMCg8+fZZUGSAPCAq3bkPSFOZmZmFGVSk0qlUmlVAAAk7aca3drn6lU1+e733aDvCwnj5aVqu3d0dPsrH\/44179R5+BoXM\/rMfT1V2Vqt87g1\/5+f+W0aveXmw\/nPzPX7nufd7Lq0FQ+ZxqUe8isnXVmODdn6Moh34E8D705QImeM5weBpgP8+TkJvvs5ioKisZPkgBN0RQ0518FQHey0anO1jxc8D\/neuoAtYGHvYdjhBhV\/vcBcxfR54c95IxP\/d+pAg40Zn8l9SvEIa0N7eIM9QjN4WarAZIewAB82OUiS\/ZzHtKv75c55oD6OIHeMCR8ow4AsEsUHVy+++9zQil+nKOarxRyP9VJJ7hjxADYNBd8YL2zMX+o6Ba3eklNlyH0LgGmqy4KDBgQDlCFBpsqFMAHgwI+6Px5ddmCAAACnb8+mwxLAgAP+Ct466PjyUxKmqYmTdNRRFOpVJECAIDPQ3kgcu5Fmteq7zCx+oSP+Mvv61n\/P8WdrfOHyRfyh61a3rTfnO333M72FyW3rclJS7h7sqdrn+\/f2AdeNxoSnvqqnfWZoiuB381MF3X2\/dDzO+ckdwG16UnBwC0SMj9wcGuHY1Mpz7mX3kqbZwzHaHz+ceq0q+r51jTJYfP5409k7Wols\/jnJ7s5gOk7VX5+jhU\/LBiurQMk6a+sdmrMt+kNB2hmzv8axyTw7NJOKvWF04+FmcOBkRg55wfVDroSp4\/o961v2z6boSCLqil0w8DuT+z6zgII6uz6qjoA8KEbmf7BGOWm9fGvGgCYk8AFPgOfKwDJCdKGkgaEgCtvGtUhJDAAWUN8yQwdOgoSYEgCwAYe6Pz+6LIgAIBA5+fnJAORAGaZOaZUOZlRZpTUKKJGVCqVShVSAMpALdbfOdxJCvnisDc5BSgET\/djvvXvd87NV+v5v1kE8K2Ds2k8Hjx4wRZyP++LNk1N9bLPzrf3t92Z9ON5lAXXx4DUxLnbcA6nmq5Pcs7nQ6PM2syZf0HV5qN\/+D3Qf06e7jbRnIv\/15kzxdXpvgaqNs+wme7e8PWbzxx6n8NUzWS+6cMwXZmL\/nU9ymsYYJ8\/ydZBzTA21MMXQEIHO96Drz9OHKUFFlANfONs+OHvaP3kAGDzRSND\/foJCxskLSWf0On0Q9FDPK4BgNxsoP5lyfDBf8q8bM6hWt4sfP34\/E8sxydCfkXV2u8Y5uN7kL\/yvSkDgKo\/rxJ88FMPrlcenLF2KDrXSHaG1AQ\/AwYDBHSDAygEAB7o\/PnqMiAAgETn7+8u2wkA4A0yDOkb5nvJKKIzIzqpVCqVKlUhCAAA3l\/NvDb+fA5\/ua4vIp9G7+6RgQc9fdmxhz+dbeZkPqve9us\/jKrT\/PnH9\/3q+8ennPO2bs+osJ6m\/d7Gt6Y+OOtpjru\/TpW+5RRdQzF3Hn\/bNSgPfeZb0f\/PbKhkT88e9IAZQFZ\/P0xrfl395bs\/\/44sOn44jenLDHPy09lz5fwGmr2ZHnpvDncmU1Mclv8GOOyFzx++BHSD\/ICgOGzYzG8D2w2H871T6BMvPsk0Th8LpzC5SU4Sfqr+PtRh2OM\/mwNkstE+PwB2c+9uBv4XRPg7LX1qfzj9R8f\/vgJ94XSsVdQgcTIG+EkDyhKczRYsj\/vRknxa4OfGOIo\/XE3OGXIVPAD\/Jw5d\/eHdmAKQFXG0CGAdlQY+6Pz11WUqAQAEOn9+unQIAOABxcbzBByK4+mZ1CgqVGpSIypNpVJVAQCgrPZOl4ejUb45cH6deHgVrMu\/D0uvLk9sXxXKI\/9Mfev9WHtQzoN5fSe16WXr6zJeX6ZGH7SefHtb38d8uP84v+7fP2fSlf89xENRu7I5TPV\/atjXzvk27NlZJ2d\/dUHnZvg2ZO0ZfvQDmTNVMPvuO+gEH3zfuBqG7P70hlIXevMt\/OHE9tRmmqNTXBQH\/qiO\/HsX3bRp997zx6z56e99g\/sdJNp+fPzwQcIerLffuwi7Qyh+vqzkhOKw\/z+aQ9fQei6UbANJADqBF\/VrLgrVPZAPBfBR\/Dec3t7ZskU7QCkHCQRJ6w8LP78028KaFFTCOecBi4P9Z+8yFD90ACDQQoLaTB0V+O8YyYmT3KShNJcVGmcgNxyEjAQAPuj8\/W6yISgVJMGg8+e7y8QDFIBzQcFL9szMQieVjiIqlQKqkAiAyB00M9+9gRX2VoQA0M\/Xfjzo3\/rld2Ep3a98a7z31GOLP89\/frj8ylzPn3P9dZHp8cd4kP2\/wjz7c\/+\/2LT2FDWZfzU+nvd7GX\/+mnPe3W6Drk3VfMU5AwD91VP9UFW5e5IE5Ien3j\/QG6qrFtic8\/07\/b1pzsFFffZBudP1sLtOHk3y66Ry4L3hUF1QiXoYIPfNaajmWs\/RC6ejA4O\/VCq5H+euI8l1+rHfw4ZvffL2r9zAPnZ9aQMboEVL2pBfp5z+OVW\/VcrxsbOE03JY2\/GY0yeyZmD7C9EH9gHo2jcAGy9v\/KG\/\/gAU+HB6eCv+\/kv3Uv+YVc\/V\/hQc0OkxfhKZcu4EtSgBrwAnNGioK7dqCkaznJzwVsj2MxmaADCEKAEAPuj89dNlIgIACHR+fzaZEADAvFR4m4a78ORwkBnRmRklNSMqNaJSVQH4\/r1r\/29fJa1dbwwt71XWptr05m3VH2\/s3+V2t5gA\/Wz5uHa0\/3VncR5dfJjHb5vazct+9t\/cucj\/TH7q21XsPzX98\/51FeWtPOTpOXll71bDvT\/dyUn632d6v51Th2m6+fTMfhw\/\/QfT7\/nxZyd\/tH9T0HDe2pN19m8ukuqerj4AnCmYX+7hvHTD7gRODvvO\/s+m5wCYPxTsAR+m5oXt7+oNALDHfLWpG\/YP0ePLk9ibpNzfNwD\/Qzcb0ekDTi+\/wLl\/fN2I6vgBcAFyng9Akxsw6lF+Te0NDd9ooBz5ZJRh+K8dQPHlgvq19OXrDztwWsnhqPVhOqI\/MiDqDAIqQ0j4kHyiu\/w4HGIdlJIeJwcD4ALAdgghAGFTbWxI6GORyQIe6Pz+7jIhAYBA59fXKAMCALiByulJTZpOms6IGsGKplJVBAAACVPGqn9Ymr\/t6e3nz52n9o\/f+vTTE08\/qfvr+fc4MQ2e3zzfHPBfZ+Og9k\/2y2Kdx6Pj+tlBf64\/76a7PUp9\/+vWM\/B1\/lTX7zS5qa5Tc6p5ukjOPvRUfc0++8M2huPw\/3dP46SeliYb+u6dNOd0Fuxizj6b6fPnDuA72Pyr0nMGYH\/w4fiqC\/A2e1eyBza5pzIHd76uSbSrf4eCPm2QgTqGWIsNwAbYH8BhP5x+nMKTAHzcgFL7S3b1hi+jHMPe1SPzATb7tPxuQR+N+PlfaPHHn9o69wudTmH5\/9VODjndDUhfGH7HKW0SUjAE+LeWK1dd+I6jCgDYmGLOy+78AwlkKZAVo2BJ+cUjfiQAwJnNbAJsyCA0MFsBT2dnUwAEkZkBAAAAAADDrUxACQAAAD5N4mIV\/0P\/RP9Q\/zv\/P\/9B\/1T\/RP9D\/00BPuj8+egyIAERGHT++mwyIQCAG47SSZoaJU2lqRnRVCqVGimCAABg9uW39yfm89\/9j\/ofn5+Ht+orXlTSwFufa\/Vf3Fy29+mnae+bPB7nR+e+6Te+fUkmmfJBXyz28\/SzefvrVH+d75sqOveb+buzsv7z3+jUbDyq9s69oZ7sapo\/kw7148ioX3lN+PaFys8eavPNzMF00N99a\/0csjl1VcLhnM23OsOp2fnFr+DHOv5ndNztzZ7vnJ68OK+1lziFaf38asMD3XN8n1WHsH+S5iT7k5tO9v34+HD6vwO\/Huj4A7ZpDoc9SMwFAADDiz7aZwyfP2ycXPw2NsmZ8rYFDvsJbOqXQENCAeWL5aMxYKArAsDBdz8QOa3vHIOhDIIZNYEHsAtAR5LOXwDYbvwHEr5xO25SE3ZQoLtpQtO2DGQaAD7o\/PXdZUIAAIPOX19dFgQAMPfUe5hjnoWmkxpRM6IjKpVKpVIVIQBOH1c\/4o9JJ9MXS6W9fx0HyO1RTcu08qL68+LBxU\/T2YNPbrf+frDY3EqffshnPXkRbFsHPZ+fnc8zmykvnpZmJsqZz1dC5x7ld\/4TVQ7\/vk5f5ujfXfvB24fafu2uZZ1+NHTmDfqpu\/dfdRAAbJL30Hse8HTNeX5Mrc+zUb93Tn++x2nXdYZT9S+Ia89+mbTZ1\/+c+P+D8G\/HruEQ47NzoqFy\/w6+ED4ciovi0KLZqE+eX+492s6PD8jdHxtx7v\/qHbmxi4H0ZYvt\/higwV\/FJkOnj7jknLhOgHY29eEDx3ACxU\/VipiPf1\/D2a8sAK\/HR8JYJx7r7ODE1zHxOsloksAf+F4cPE7ArXIMwC+SgKFOnQubjAIYkKQBHuj8\/tWl5x4gYYJB56\/PLhMCALhR9LMzo6RmRpk0lUqlqVSFBADAW0Yux3tTJ7axc3TOSt9qz\/+s+vzue9+\/Op+ew+\/e+HHdFrWlzdLBzW3vv\/f9yKfTf2D88WveZ6qO\/Y39ZrZ9+rq+7nNYyF\/2oStJ0ZPdn4r3e3re366m6L2nJ1dyNuew99x17NhfZ+7\/Z9fp97I59Ob0F1P\/0wh2cY4\/rXVT1V9\/\/h558Yn1zPlNDxwodsacfmsSH8A+Sc4w\/3N29aZfmDIH6smGvZlzHzeHvS02wFD459GcY53hyJO\/bGWSe9hmhGwLbPzbZfMbNntvkNj91DwosC4a2FDOpubNZx8ffl3FCH45qN81sdSiHwxP\/GvaWSNX\/eDjSvNx6z\/vwDv3\/07tGwAYG4fUHx\/mBxCdGAIzmzkaMvPOXgIGEgNtq+5AGH5oAzIBMgB+6Pz102VDAACHzl+\/u2wIAODcJSgadJRUmhpFVJpKJagUUBUhAI6+reOnIDu9gXRpeHzyBlDIOXK0\/+pWKdG\/Lnv63\/+6ug25z+XvUh\/+9OvLp\/uL8\/U\/y5WDthlPPmjfP\/s6x+K+h9v9fr9N+3538\/f8Ye69S\/t+59Hv78TL\/9B1uskiEyAn\/adzT5RqOdhRQNX5J+TX06OT+\/T\/TDNvsR9Os8F34ysOPiboj8+N+40ffvh22J8aPqTm7NzXRycv+PcdJ\/iD3ZtG\/zB3CczH91ze3yQA\/LMP8713Ohz+2Nr6w89wcM\/65fhwsHNGkHAURfyDtq3SFHwOfcxHlf\/MD0kaMA67jBDrC2iWOIpNMwBD\/swWIBLhjeOjJs\/HSCcqXPhIzoIP+GTA\/Y0TTsDeQCYI7A8ys8C+AT7o\/PlsslAHBSDR+ftXl40GKCDJnLIsNuzMzChKKjWi0lSqVFpIBMDugBTHYE\/fL2rne121CtAHtw7WD89XKqk3Rg+n30x\/\/vgg+UZL3jnbWv8aZ5rj\/Xncaux9Pqd4+vc9Pt0w53N35+dA8WczkzX02f3wNTM9SX8+e38HmW437DTMlVTV2x+qYH33zp7N5uOXZooBIL\/YXTi7gfP0eW+GrzxA47a1MkL\/ioQ6nKke+P1h\/zve3BwrftrTlNnUpH6wbzY6j2wc\/+++d9RO\/ymc8LucjOkYJCfxDxyrKH0Oeg4k73edTS7oqHEoR02ajx8VyMheCMdQkFZRZnNhijkAc+DzD0j6OAQfR2Z\/wVc\/PqSzP8vxxyZ2zLp0YG1S7oePzk444VSp4PiRGCSYAQC4SGSDw2C2S4RdlmzJKD7o\/P1VZVqCBoBE5+9fXTYEADB3LHq+x+JeStIZRTSVmlSaSpUqQgiAvN7+fjhXOnW1M1L+Lp0B2o6Kt+Zvpw2pvbiyrnz7od\/ztL4z\/r3TZw+T4d+zPs+Pe14\/39UZlxeFsXxUaOOl\/dYPZobJ8bsnqbt1oCCHec4\/99zzk\/vrNse413\/zLQB+vSebfRaG5PdWVne+8532diq\/+7Yb8ny9BcA5+wAUL9B0VZ3HNPDnVCd\/kq+nE6vrU19Np\/J2ugf23A8bDtDqfaIidus4ydmHEz946dvZY\/b5n6L4+eP091I1Tj9eVAdGcfnviC1+JPXodb2ShLqPj9gkZOJbezYA2ocMhfC\/iKxWUeEOIz1\/APLtQ9KtPB9OCgeQPhKQpu9\/H2CJnAQar+RHLGoTg4rxEgDAUZRLMManCbMWCEAAHuj8\/uky0AAJYND589NlogESRjDHKhbcHB2dqGfvmUmNokKlUqlUqkICMLC3dLcZPz1M34frR\/arn0Npq+3R9nT8GPpJRyd1AFouK9rFH7c\/PT3MtVfP+Gbv1rhv9HCa518Pl9u9\/vzh04\/z6dM+dKTvk6dqzyngrZnZybzJ5zRkb1ypbajX2Lczc\/j89\/5jPtBdk7ttkffX+XdO8+xxn3fc7+fseshDJRvYeWZyV06ezh\/Pzj69u+ciZ+e5poq9cU91DjNdWTPwBfvs2rWh93B0z\/XzsDfauHXYOL7vWImInzD5X497OUnu4oM+CPOr4+M\/A183yaG\/AIAaoD7nputGZn4+2T048zf7sKu2gSPdetJObAg7eThgwAmp09ixMDiGk9EcfVUvJBSIfESichCnjw+NT9wFOKvFVvkeCChTFUAlCgiFzSM7N6CQoUEEwbA3Puj8+RxlChwACHR+f3YZTgAAD1j8Lhq3I9AziiJqJh1FNJVKpVJVAQDwlm3M3Vl6fkjj3vvVjclQ1WRpd1euVuhNqrxQu4+aT3ZWS9pNIrzVx1+VcGD\/x\/E\/jfZY7N3+\/X2fhwev3x\/CDfWlYtp54OzpgtO\/YvdzvnpXdmM419z77NkUDBvOf\/5pHvXwA0WdAxs494\/vv\/7\/3380P\/O6KQAY4ItjtRzWOgGP5v8fv76dMO\/7DNFc8zIUvhngdI8K+IINHDifDSSdqQ\/J6NgFUzjh+NhozTgFs+eg85Z20Rv7zKH+piPWaeNwfN2oPQMM+hp9OH7EUX5IbRkcWUW3gAMUh\/8ufjL+48NZ47SWMEpBTg4nlC3Bfz\/8qH8ILK+QX8pmJaRAAQCZEzuHs\/4HS4R5J1AGIFgABrNRyL4AjQCbTAA+6Pz+NcqAAAAGnb8+uywIAGB++td1ODhLZiYd0VFEU6lUKpWKkAiAL4fEpIPz6uj98X8vtGQA1\/9fzNlia+me8UE\/sSP4018\/rbe\/ef7j6cGtP7XCXNv79WBxMrjMrV1+lduWWp8XBzmf3VrnqirtYv\/r9+lprryz"],"libraries\/H5P.SingleChoiceSet-1.11\/sounds\/positive-short.mp3":["audio\/mpeg","SUQzAwAAAAA1bFRZRVIAAAAGAAAAMjAxNABUREFUAAAABgAAADExMTEAVElNRQAAAAYAAAAwODI2AFBSSVYAABKyAABYTVAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMjEgNzkuMTU1MjQxLCAyMDEzLzExLzI1LTIxOjEwOjQwICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICB4bWxuczp4bXBETT0iaHR0cDovL25zLmFkb2JlLmNvbS94bXAvMS4wL0R5bmFtaWNNZWRpYS8iCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTk2ZjExMTMtOTQ1Yi0zODQwLTlhNTEtODBlOTg2ZmQ2ZjU3IgogICB4bXBNTTpEb2N1bWVudElEPSJlMWE1OGY2MC0xNmNhLTU5NTUtYmUxNi04NTU2MDAwMDAwNjUiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2Y2M1ZjEzNi1hNTU5LWJhNGMtOTgyNi0yOGJkNGNiZDc1ZDQiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMTQtMTEtMTFUMDg6MjY6MzYrMDE6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDE0LTExLTExVDA4OjI2OjM2KzAxOjAwIgogICB4bXA6Q3JlYXRlRGF0ZT0iMjAxNC0xMS0xMVQwODoyNjowNiswMTowMCIKICAgeG1wRE06YXVkaW9TYW1wbGVSYXRlPSI0NDEwMCIKICAgeG1wRE06YXVkaW9TYW1wbGVUeXBlPSIxNkludCIKICAgeG1wRE06YXVkaW9DaGFubmVsVHlwZT0iU3RlcmVvIgogICB4bXBETTpzdGFydFRpbWVTY2FsZT0iMzAwMDAiCiAgIHhtcERNOnN0YXJ0VGltZVNhbXBsZVNpemU9IjEwMDEiCiAgIGRjOmZvcm1hdD0iTVAzIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9IjZiMTA0OTFlLTAwZmQtMDkzYS0wYzdlLTcyNDQwMDAwMDA5MiIKICAgICAgc3RFdnQ6d2hlbj0iMjAxNC0xMS0xMVQwODoyNjozNiswMTowMCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgQWRvYmUgTWVkaWEgRW5jb2RlciBDQyAoV2luZG93cykiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9ImFmMzViMGU0LWEzNWEtY2JkMi0yMDcxLTU1MTkwMDAwMDA5MiIKICAgICAgc3RFdnQ6d2hlbj0iMjAxNC0xMS0xMVQwODoyNjoyMiswMTowMCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgQWRvYmUgTWVkaWEgRW5jb2RlciBDQyAoV2luZG93cykiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OGFjNjcwMjktYmQxZC0zYTQ5LWI5MmUtNzI0ZWQwMTFlY2EwIgogICAgICBzdEV2dDp3aGVuPSIyMDE0LTExLTExVDA4OjI2OjM2KzAxOjAwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBBZG9iZSBNZWRpYSBFbmNvZGVyIENDIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5OTZmMTExMy05NDViLTM4NDAtOWE1MS04MGU5ODZmZDZmNTciCiAgICAgIHN0RXZ0OndoZW49IjIwMTQtMTEtMTFUMDg6MjY6MzYrMDE6MDAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIEFkb2JlIE1lZGlhIEVuY29kZXIgQ0MgKFdpbmRvd3MpIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvbWV0YWRhdGEiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8eG1wTU06RGVyaXZlZEZyb20KICAgIHN0UmVmOmluc3RhbmNlSUQ9ImFmMzViMGU0LWEzNWEtY2JkMi0yMDcxLTU1MTkwMDAwMDA5MiIKICAgIHN0UmVmOmRvY3VtZW50SUQ9IjYxYjlkMGY3LTU3YTctZGJkOS02ZmIwLWM3ZjMwMDAwMDA2NSIKICAgIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjYzNmOTM3My1hZTIwLTM5NDAtYTNiNi1hZTBkZWExYzIzZjIiLz4KICAgPHhtcERNOmR1cmF0aW9uCiAgICB4bXBETTp2YWx1ZT0iOSIKICAgIHhtcERNOnNjYWxlPSIxMDAxLzMwMDAwIi8+CiAgIDx4bXBETTpzdGFydFRpbWVjb2RlCiAgICB4bXBETTp0aW1lRm9ybWF0PSIyOTk3RHJvcFRpbWVjb2RlIgogICAgeG1wRE06dGltZVZhbHVlPSIwMDswMDswMDswMCIvPgogICA8eG1wRE06YWx0VGltZWNvZGUKICAgIHhtcERNOnRpbWVWYWx1ZT0iMDA7MDA7MDA7MDAiCiAgICB4bXBETTp0aW1lRm9ybWF0PSIyOTk3RHJvcFRpbWVjb2RlIi8+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw\/eHBhY2tldCBlbmQ9InciPz4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD\/+5BgAAAC+2dBbQUAACPhOE2hhAERMT1PuYmAENyKpfsUcAAAUC4AOWWIk\/\/4xj\/\/\/\/\/L3\/\/u\/\/y7u6f\/8onz\/pX7u\/\/\/\/\/7u\/\/\/\/\/\/7on\/7mVL5AoYWAoDQx30RL0SSxc8gBcF49Eks+yz7\/3FwaClO9xuKClO+iSKJX6bihkvZAoZx\/8MmU3GiAHf0RERz\/3gQZ9Bd4fw+XD\/58uH\/\/E44H\/y8H+v8\/Ec\/n0\/LQhmtRlEonDk2qhNigs\/WozQIgUB\/2H32LIaJMJ2EkA7hDHHdZPjjUFpgN2DQdI8mecwJxMqls0dndBk2qGARNBRh+zbTxEDRZwQE7233wtMAYIH7i3g23EA1f7v13xzyLuZkDImQc3fTW\/QU3+qs0Om5onTL5vrP1dydxOYHCM8gsTeAcAgAgAcAZQogYkAAIxuAIGOSCx4UABDwECHx4Rhr+gvUmRHVETKFB4BJO3wH+m6PFvTKZq9bNMpIp1d3kRj0E0D9Rpyo0+JdYMDE3A5dI5oWrOnbCoXBwIQAJqn9p9ae1rSdma950vBq2BE0LT8z\/+5BgHIAEDUnYZ2WACgAACXDgAAESQZFXp70NoAAAJcAAAATMzjMVvWmLu7XpmZmbY0dRnIShS2IIkqcsuXHRy7h0ffRpd32ts\/OHJ70su80ZGLuWyZm3VWrXa1nKz3bWtYDlbJeE13IbbI7ejRBklkulluc0WqT\/qdh6KpuKs6CHBgHLSV5dbcz1RgWgP4RMymdhYYU7l8Me8Y+L5thVORIE800g0tl8xI4Rw9s0WqV\/\/61GCwsIcCwfEElqhFFFCOMGhfUbBhVWPtut2JGCyitEwMGuHQoHCoOqrubZYROXe0xyHpcbSdjIT9Jv90m0ssfCW13Jpb3aP3dRB9jatIzXXb37b7cmHHGf2GZ5d77roEQ4z0NAG+8\/Ajy4KVS7P4HYPAqj+ioqFtz89FFmu6bu2xI8BrEohOo+fmG8hrt7S2fi9\/\/\/\/\/jflmfSsz6PFhQ4kOIyyM0Fia5oK6i\/TFeEzRswn0a1rXiRoW643BpebW6xW5+9i6\/rXOc5lkhWzXNJ4ta5tHs7z\/\/bNL6+a69YV9f4jNtdz3zrvNTM24X\/+5BgUQAFNWdV7WngCAAACXCgAAEXmYlVuboAGCeAJgcAAAAb\/\/2zIqiCAWQimiSiUUskkklBDPVAm1XIMBZdkkYrxCXF\/jSSwv1OhhBGziD41AmF+KHGbGNEmEIhjiJJFsrsBjAQHUhAAA6ZDEC+tIokWHo6kTrLx7dBOLJEOEAByiKJfZBb1kyI7FnixjKC0qSbzZZiRMrol8c4QWFwhxAQABOIbI+tVqZ9k5mb1QoLFtIULNkBHcNokU\/l1aCCkOgzonkFy6Tw4DQi5OCpk6T50yf+1X\/X1tUqiXThmU3NIfThwAgH\/\/\/\/\/\/\/+igCtNBBJtxtpuzT7PFTQqbf+GJqBWfAgTMQBzyecy4fLWuTDq8qo9YayyIUPIkwjpip1mbmbGbZrvWc60\/WJmlcK8uxxH23KZmrXNa1xn2jwYLi+rF1ChPrVr\/W\/xaNCzhuOY6jSVTews2vBiyRo+oVvbEL5r9Ra61\/\/\/rWd2tWn\/rWDXGbWtCjAUCgqNVyeUbsye24gmUYzAhREl1lkupIKgyO24Q9FJK30dkyVADDs+6P\/+5BgWIAEpEvWb23gCAAACXDgAAEUOZdV7eFtoAAAJcAAAASKFJikjqRCvymetpuLtUI9aDMocl9nchvfQUH8v3rFxqqvZ7OMzj5tEh9vSFH42bXfCzyFPpnjNv+3StWjlOk6mbqICmSDgfyQdJrShbcSJXPnzZZNVBK4UUs0vUKllK7Xf3qrtqb9tH4vRWVM9E9fK\/LPipcjvZW5rJ6hv\/zbGM3fD+J1gLc2U7dd9dbf8BxZ\/Iy6jM31gphNEaEmlAwcmqCSIZ6QfqtgnYk+nD+RA3gYBvKlDGLcm75fr8ld71AJSTVlhtjxdp3KgCNmQTSyc2gnccK1y\/AyGSijs4SqQNFxMwOhssQmCwNc8kgPjhLIsccwzG48WPq+Jkouz+xAvouGlD4Mgxby6n4G33OU\/0KZrTA3GzS71i371jDonHdo2g8Sp90oMtk211t\/XcsOjIXdVUszchlZn50Kg5q1GIQVuEviTsy69lGZfDc+6AtGCovJs+a1q1WvTVbVXDOvB2rM1LpPSx170nJwu4ItgKoqka6jfTrrzVdJus3\/+5Bge4AE9mVV629DaAAACXAAAAEVRZlTreEtoAAAJcAAAAQzFYmREpLBZgeEw7Gm2IQsyzyY3M8cNp4sjRvn0nkdrttMdifL29EwogkNtszH+gzznie9n9NWHNNwYnrNUnCnpIn2lnuNqQOM1SBUPM3BKuNU29oL213+22\/IKhqJRZ3Ee5LDlmGTOCVN4xqYBwcOWM3vo79EuTCcMYP8HesI1ot2r6mwpnKSBLh6ZpWd2oIbOrHpKNMtXlxp5QZZcTDsJeyXWJVsUMU1Cbs6OIypfolbcVXKF5wK7I1rpHlhpCdZkvFNAgkxE1MsuYlDTJZ2siUt25mzk5IzdG0c1dR9o2haQTWXWNTYWp7d+qO10Oe2hV46JY9dD8TsXp0qwjrjZLkbkjaSd5947EY44bCMpFIbRuST6nBcjwFOrcigeelsEPhFoOi70kRt4VKX86nNTtPRSupK6TjCWK3oxKpXNxh837QkLDGpv4pLG87TJuNyKUjPcjKCtp7FuS81kdzIkj4KlTZpYlmTX0MF2GSk0CKhCysojzEWG24rXkn\/+5BglYAFZGdU629LaAAACXAAAAEWFZ1ZrWEtsAAAJcAAAAQrisVRo07UCJRCl5xlNed9DJtJ7CDEUUbE2V2zqBva6+zalfJbKIEqYnFXbx5KofyZNoCyNkuSSSNpOceDscd5+Wi5Sp6I6dQMfPwdNk1Ft4wu5n56JqiuHYN6NRladtrfV+xVirmkGLCICarg3Wa215CPx7aJhtt0WiZs8KaDKqFAygtBPF1cJE3NMKx8Uj7KpKaTgeQCcnrovS5hth6aepoWnSmKbmzqJ5SyMuzL15Tud6wD4zOZ4NHRITDAlWWQhvCWCJdBEkFcGkDAwGtA6hK9V4BRWo0jMKDZ4QLrHTYkBc0MLgth4QlvbIS7JJbI25Aj0ReG4q0hWSNWHdmhKpnxq2O41vIbTZpZEwrI7cxA1Wv2jTQoUa\/gPZb4u8EhQiG3MzySHMhsJM0sE\/Um8gH7R\/pKPTApE1CPo1Z20vKzFYVh6qxQ9QuFcmLT81RGRq8kRO0WSoSHh5EWBVyx0lk9WWnKHqRbeNSla0xUo8P6nRajZbUU0\/Yqzdj\/+5BgpQAFvGdWay9LbAAACXAAAAEXqZ1brL2NsAAAJcAAAASqo+YiTJsbLyIjpmTkspv1MfLtXpvsk0uumaaGh0frkcKlxhetXO2e56Fk9tpLtstsjbsYhuHIlGYum67McdqqRExEkjeWEw1irUVnSCVrVhFLbYe3GO1e1UJ3puR1KaME7lrbfhLO1dG1JY4O\/fTl4+fUnJLITUbrd1ZoUyndKht\/RhiYG0AptmbpW9RpIUEu762yHQ6V0PZOrqLrFPtr5RP0YtWiZXHa6jKegoccLyc5i0\/vd\/InUazoKdNjpR6tqjXXL7lYWoXqDkeh+Wzc0c5CO3yTNSUXQ6EcP3WxxpQyvrYwVJG3G0k3keaGn4a7EHqfu7JbieTrGZiomWerYss0N8jXiaIIS8HOSdtalQsRLxKP7NzNqn06x93e6o8gNPqxYpvqaPb4+LDUgLT7URbKZ+hkwqgzUXMD2cP0UZNTLb\/CfHh8tQhPspH5wplpW9OEdElYJOool5YYJ7DSfo6Kzs2aftLhq\/CTENOpaMF6hHlX1LEXpZmrD8H\/+5BgqQAFvWdXay9jbAAACXAAAAEWsZ1VrD2NsAAAJcAAAASazWkbC+HanT0LplVupZg7be3ai38q\/rnwStuAtshKkicjaSc65NG77jyiAc5mmupMwk14UQgap+VaalWc63srKpDwVcFLN93eyy7TXuyipuxWiMb\/dG8ERis6lsAQ1PkWE0mTlehsuemKjKRJ05gq5GPk6ZDnXIioP6YDYk4WOWPkhQaK4geDEdiuj6E0aUpfoCoZXQoW5Ei+sajKEgoQSKcSLil8wwmIJ6oK20MYu30WRJ86dnSRY1e2UITrx2USVruml0VHofm1MQZSpWVtlANzdttkusPA5FaGIOfCO44YK6YySexYHOW6krlcsxnLFelbGHJu2bdLcpO87jL7Fyfr3YtN0n\/rGYi1p3MQsWd6osos79oVI5kvIdFUNBQsUakYvexPkB5QRgb0ZB9RESrCCxSIXpF4H9bGAqjkkPiag8XttonEKIngNI0a8IvONlW5CMfVNjaa4DrA8CxwUSCpr9IlHD7kSSy4phqAnkQERfCBoxRAhxk5lw3\/+5BgsIAFl2dVaxhLbAAACXAAAAEXCZ1JrWEtoAAAJcAAAAQOlycjaXib0hG3gPdsirW7dbbdLXmf9wn2lUdnH8cGmXS7xlUcjk13LHHCXxm5hFLrZSb9vC\/vC5V79yl5TVqkups8v\/7U3c28wlmZYUkfm3KfXFNmsHEmpmURAU0fR0dnKKwKRYQ0fQaMGZiREum8iUfqgGYBXFabiCXO0iIEJY2IaRGsokFeAQLiInFIbNFWGCMhIOhiGbso0odRMLoILoXHkzwytbbYyjEhPFVAK2QbIWFii+DBtMlZN6RiubfLDKnu0RVuuuutunXBoVmSCIO5SyOmwa1KThpSZam1h+tp6AzN6s7OK4LYl8wL5jxGqjZFbbRIW1LI\/l+Xsmo5oAxekvKIIXIVCOYnmatGb0cPxQtURLl52fLoxLSGqzkS5b7w8HxrGQSSWxzQvOQVTxwuI0JletHNo9qbpXFSRtBNTyz8cdViiurkWL3sX1mxhiS2Wdta5+kpkyuo+uYSEg0j1OlPkCNZAY6+VWbzZGrgPEiHii7MbZwZgFX\/+5BguQAFv2dS63hLaAAACXAAAAEXCZ1LrT2NoAAAJcAAAARoYxJla7a2269Br6NCeuXwHDUZse8jVTSaQ4WqIdnj+FP2yDOIsAPICqYqUiV31nWrPK5nguoV7Nj\/TwaJ7k21pxwxhpeBzU0makpV87eV6lSJrHHnzNjc0eoupLSgvLQms8WbJGzo9tGcEwvMOkpgyUqoC2PGxrlsKY4N8jMX23Sk84oXqS0enyKWCtG0xTT\/5RJZigUqmaUMi+fnlqK4NL9kXMWgdgeYmUA\/8SF7vfvI0mndKyqgErJNtbbc5kpgNgEDwJWgykjMae94jBSBokyxqNzapK4YJ6qcBF9\/W8u85kplTNblAkZYNmR9BbYzhEUOUd1t5NyxtmEcHp95VlCY38lg5Mh6fSqFTiFeiwtLIcPzXBLEowE545HEeBem7nuR1SMUfjJKNQYn1nFqo6JZ3dM1Y2Lx1c+PLFj8w3uvoQD84XFBNmE1QV+TLU9GRxQ1LZnAdPWYOyWb4e81RuWaSRzCBCoTqJhyM407qwDyWQK6TbXW3UT0TSv\/+5BgvwAFrWdS+09jaAAACXAAAAEXdZ1J7T2NoAAAJcAAAAR7QIYg6JwxSX5yIHOg8B55zO3hd7arTPviTan8P7azt178fr09m1hWmKOvUnLUurRSigllI6fREZCTorPNNG8nz6CdjpAvI6Gw+Hwdpzs5dPy4YmR2rMiKZYdHw\/jkIhPIJZJqlKpHp40PEx2yNKOrK5KuRHaYgHzw0HC1IZIKc9j9lXEsPlxTXn90pXfJi9CKVHqIioXfbJR2sOzNEfQOIbtVvGjdo8XTCsXMHxIPCXMBWaQ0Nnp9bhpDMzqAs7bf7Xb3oOhCzICkspeGjoqFl0AlTq\/ZM6c7ywoEr7A5ALkV1mtocdxbGuaZs1nLptVKtUGJe8YYCVpeVDNU00dI1aGhM3UUWFRtqF44RHK4piOZnJXQ6JBOLCNASVWFqApUOXSGkRunMZafuYyw8cHJcjIZTeVFzCGXKGSM2Iemht73a4QVhcH4SR5OBlwjFohtoJPY+ilDpGXySS4WjjroZqlaouXPHzr3qXOKUrkZVgHXqNoqKT98pTLaMNL\/+5BgxIAGMWdSaxhjaAAACXAAAAEYLZ1L7D2NoAAAJcAAAAQ2ipLJbI5LLX7dNfdaBJLK4\/frvLFzgsemlW9tm0yOcRqrDfAmVhrgQ5oM2mRXYjSOMO8BlfJxRqxr29XCTUaexsr1d7o\/YaVPONULtzg6jE51G01L+OE41gPzFdASStCVivbSGbVMhOiPR9iQhimz3SOwZe4fG5ASsHQ6l11UuSEknGj5OlgxH8vrEr55GULvlE7HtIsL6sTFN0cbJ40rUww4pQ+LywkvIZFOjosHUMtyYsvRMxMp4CouYRsHFCmIsIaoYkiLJbI5LH3yquk\/1HIIXEIxHXSnQK4acMC2cFyEnE19E+whlUciquRG6gzMFlyVfVJ93nKbY1MaQ\/KTickLzBOJBdGgXZxql2VlSxViU2U350zLSFDBJOIVdgqOgcBksa6SMllmSVZi7f6FUywqGUDZxxCoiJsRLPk0hQni4sRhEllLNJaVIZpIiYhhOgtCeU0hxJEqRLss3A0ko\/FUp1JWUrQsGo3IsmoKm3JoAGm5G0lTKIPrEJf\/+5BgvwAGE2dQ6w9jaAAACXAAAAEWHZ1F7DEtoAAAJcAAAATRRaHXKUxEIBUgLsKghZYC1JaSo+Y9XqeXLA5uNt6fMIoDMPAgImGJGlXDvlTTs7NakjTjTgMDIJo0EhYRmQWFhcMgIWFhGZd8WZ\/zItpGCwsKmf\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD\/+5Bgw4AIKCJG4w8yUAAACXAAAAEAAAEuAAAAIAAAJcAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABUQUcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyMDE0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="],"libraries\/H5P.SingleChoiceSet-1.11\/library.json":["application\/json","{\"machineName\":\"H5P.SingleChoiceSet\",\"title\":\"Single Choice Set\",\"description\":\"Create sets of single choice tasks\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":11,\"patchVersion\":44,\"runnable\":1,\"fullscreen\":0,\"embedTypes\":[\"iframe\"],\"coreApi\":{\"majorVersion\":1,\"minorVersion\":19},\"preloadedCss\":[{\"path\":\"styles\\\/single-choice-set.css\"}],\"preloadedJs\":[{\"path\":\"scripts\\\/stop-watch.js\"},{\"path\":\"scripts\\\/sound-effects.js\"},{\"path\":\"scripts\\\/xapi-event-builder.js\"},{\"path\":\"scripts\\\/result-slide.js\"},{\"path\":\"scripts\\\/solution-view.js\"},{\"path\":\"scripts\\\/single-choice-alternative.js\"},{\"path\":\"scripts\\\/single-choice.js\"},{\"path\":\"scripts\\\/single-choice-set.js\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.Transition\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.VerticalTabs\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5PEditor.RangeList\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.SingleChoiceSetTextualEditor\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5PEditor.SummaryTextualEditor-1.1\/library.json":["application\/json","{\"machineName\":\"H5PEditor.SummaryTextualEditor\",\"title\":\"H5P Editor Summary Textual Editor\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":1,\"patchVersion\":12,\"runnable\":0,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":24},\"preloadedJs\":[{\"path\":\"summary-textual-editor.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/H5PEditor.SummaryTextualEditor.css\"}]}"],"libraries\/H5P.Summary-1.10\/library.json":["application\/json","{\"title\":\"Summary\",\"description\":\"Test your users with fill in the summary tasks.\",\"majorVersion\":1,\"minorVersion\":10,\"patchVersion\":22,\"runnable\":1,\"embedTypes\":[\"iframe\"],\"machineName\":\"H5P.Summary\",\"license\":\"MIT\",\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":19},\"preloadedCss\":[{\"path\":\"css\\\/summary.css\"}],\"preloadedJs\":[{\"path\":\"js\\\/stop-watch.js\"},{\"path\":\"js\\\/xapi-event-builder.js\"},{\"path\":\"js\\\/summary.js\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.SummaryTextualEditor\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5PEditor.RangeList\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/jQuery.ui-1.10\/library.json":["application\/json","{\"title\":\"UI\",\"contentType\":\"library\",\"majorVersion\":1,\"minorVersion\":10,\"patchVersion\":22,\"runnable\":0,\"author\":\"Jupiter\",\"license\":\"MIT\",\"machineName\":\"jQuery.ui\",\"preloadedCss\":[{\"path\":\"h5p-jquery-ui.css\"}],\"preloadedJs\":[{\"path\":\"h5p-jquery-ui.js\"}]}"],"libraries\/H5PEditor.Wizard-1.2\/library.json":["application\/json","{\"title\":\"H5PEditor.Wizard\",\"majorVersion\":1,\"minorVersion\":2,\"patchVersion\":17,\"runnable\":0,\"machineName\":\"H5PEditor.Wizard\",\"author\":\"Frode Petterson\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":23},\"preloadedJs\":[{\"path\":\"Scripts\\\/Wizard.js\"}],\"preloadedCss\":[{\"path\":\"Styles\\\/Wizard.css\"}],\"preloadedDependencies\":[{\"machineName\":\"H5P.FontIcons\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5PEditor.DragQuestion-1.10\/library.json":["application\/json","{\"title\":\"Drag Question Editor\",\"majorVersion\":1,\"minorVersion\":10,\"patchVersion\":21,\"runnable\":0,\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":24},\"machineName\":\"H5PEditor.DragQuestion\",\"preloadedJs\":[{\"path\":\"H5PEditor.DragQuestion.js\"},{\"path\":\"H5PEditor.DynamicCheckboxes.js\"}],\"preloadedCss\":[{\"path\":\"H5PEditor.DragQuestion.css\"}],\"preloadedDependencies\":[{\"machineName\":\"H5PEditor.Wizard\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.DragNBar\",\"majorVersion\":1,\"minorVersion\":5},{\"machineName\":\"H5P.AdvancedText\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5P.Image\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"jQuery.ui\",\"majorVersion\":1,\"minorVersion\":10},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3}]}"],"libraries\/H5P.DragQuestion-1.14\/library.json":["application\/json","{\"title\":\"Drag and Drop\",\"description\":\"Drag and drop the elements into the correct drop zones.\",\"contentType\":\"Question\",\"majorVersion\":1,\"minorVersion\":14,\"patchVersion\":22,\"embedTypes\":[\"iframe\"],\"runnable\":1,\"fullscreen\":0,\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":23},\"license\":\"MIT\",\"machineName\":\"H5P.DragQuestion\",\"preloadedJs\":[{\"path\":\"h5p-drag-question.js\"}],\"preloadedCss\":[{\"path\":\"css\\\/dragquestion.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"jQuery.ui\",\"majorVersion\":1,\"minorVersion\":10},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.DragQuestion\",\"majorVersion\":1,\"minorVersion\":10},{\"machineName\":\"H5PEditor.RangeList\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.Audio-1.5\/library.json":["application\/json","{\"title\":\"Audio\",\"contentType\":\"Media\",\"description\":\"Simple library that displays an audio player.\",\"majorVersion\":1,\"minorVersion\":5,\"patchVersion\":12,\"runnable\":1,\"machineName\":\"H5P.Audio\",\"embedTypes\":[\"iframe\"],\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":19},\"preloadedJs\":[{\"path\":\"scripts\\\/audio.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/audio.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.TextUtilities-1.3\/library.json":["application\/json","{\"title\":\"Text Utilities\",\"machineName\":\"H5P.TextUtilities\",\"majorVersion\":1,\"minorVersion\":3,\"patchVersion\":0,\"contentType\":\"Utility\",\"runnable\":0,\"author\":\"Oliver Tacke\",\"license\":\"pd\",\"description\":\"General text related functions that can be used by other H5P libraries.\",\"preloadedJs\":[{\"path\":\"scripts\\\/text-utilities.js\"}]}"],"libraries\/H5P.Blanks-1.14\/library.json":["application\/json","{\"title\":\"Fill in the Blanks\",\"description\":\"Test your users with fill in the blanks tasks(Cloze tests).\",\"machineName\":\"H5P.Blanks\",\"majorVersion\":1,\"minorVersion\":14,\"patchVersion\":13,\"runnable\":1,\"license\":\"MIT\",\"author\":\"Joubel\",\"embedTypes\":[\"iframe\"],\"coreApi\":{\"majorVersion\":1,\"minorVersion\":19},\"preloadedCss\":[{\"path\":\"css\\\/blanks.css\"}],\"preloadedJs\":[{\"path\":\"js\\\/blanks.js\"},{\"path\":\"js\\\/cloze.js\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.TextUtilities\",\"majorVersion\":1,\"minorVersion\":3}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.RangeList\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.Dialogcards-1.9\/library.json":["application\/json","{\"title\":\"Dialog Cards\",\"description\":\"Makes it possible to create learning tasks for your site visitors.\",\"majorVersion\":1,\"minorVersion\":9,\"patchVersion\":14,\"runnable\":1,\"author\":\"Joubel\",\"license\":\"MIT\",\"machineName\":\"H5P.Dialogcards\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":26},\"embedTypes\":[\"iframe\"],\"preloadedCss\":[{\"path\":\"dist\\\/h5p-dialogcards.css\"}],\"preloadedJs\":[{\"path\":\"dist\\\/h5p-dialogcards.js\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.Audio\",\"majorVersion\":1,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.VerticalTabs\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.DragText-1.10\/library.json":["application\/json","{\"title\":\"Drag the Words\",\"description\":\"Drag and drop pieces of text to create complete sentences.\",\"majorVersion\":1,\"minorVersion\":10,\"patchVersion\":17,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":19},\"runnable\":1,\"embedTypes\":[\"iframe\"],\"author\":\"Joubel\",\"license\":\"MIT\",\"machineName\":\"H5P.DragText\",\"preloadedCss\":[{\"path\":\"dist\\\/h5p-drag-text.css\"}],\"preloadedJs\":[{\"path\":\"dist\\\/h5p-drag-text.js\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"jQuery.ui\",\"majorVersion\":1,\"minorVersion\":10},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.RangeList\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.MarkTheWords-1.11\/library.json":["application\/json","{\"title\":\"Mark the Words\",\"description\":\"Test your users by making them select the correct words from a text.\",\"majorVersion\":1,\"minorVersion\":11,\"patchVersion\":9,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":27},\"runnable\":1,\"embedTypes\":[\"iframe\"],\"author\":\"Joubel\",\"license\":\"MIT\",\"machineName\":\"H5P.MarkTheWords\",\"preloadedCss\":[{\"path\":\"styles\\\/mark-the-words.css\"}],\"preloadedJs\":[{\"path\":\"scripts\\\/keyboard-nav.js\"},{\"path\":\"scripts\\\/xAPI-generator.js\"},{\"path\":\"scripts\\\/word.js\"},{\"path\":\"scripts\\\/mark-the-words.js\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.RangeList\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.MultiChoice-1.16\/library.json":["application\/json","{\"title\":\"Multiple Choice\",\"contentType\":\"Question\",\"majorVersion\":1,\"minorVersion\":16,\"patchVersion\":14,\"runnable\":1,\"embedTypes\":[\"iframe\"],\"machineName\":\"H5P.MultiChoice\",\"author\":\"Joubel\",\"license\":\"MIT\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":27},\"preloadedJs\":[{\"path\":\"js\\\/multichoice.js\"}],\"preloadedCss\":[{\"path\":\"css\\\/multichoice.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.RangeList\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.MaterialDesignIcons-1.0\/library.json":["application\/json","{\"title\":\"Material Design Icons\",\"contentType\":\"Font\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":0,\"runnable\":0,\"machineName\":\"H5P.MaterialDesignIcons\",\"license\":\"GPL3\",\"author\":\"Joubel\",\"preloadedCss\":[{\"path\":\"h5p-material-icons.css\"}]}"],"libraries\/H5P.MultiMediaChoice-0.3\/library.json":["application\/json","{\"title\":\"Multimedia Choice\",\"description\":\"Create a Multimedia Choice\",\"majorVersion\":0,\"minorVersion\":3,\"patchVersion\":36,\"runnable\":1,\"author\":\"H5P Group AS\",\"license\":\"MIT\",\"machineName\":\"H5P.MultiMediaChoice\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":27},\"embedTypes\":[\"iframe\"],\"preloadedJs\":[{\"path\":\"dist\\\/h5p-multi-media-choice.js\"}],\"preloadedCss\":[{\"path\":\"dist\\\/h5p-multi-media-choice.css\"}],\"preloadedDependencies\":[{\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.Image\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5P.MaterialDesignIcons\",\"majorVersion\":1,\"minorVersion\":0}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.RangeList\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5PEditor.RadioGroup-1.1\/library.json":["application\/json","{\"title\":\"H5PEditor.RadioGroup\",\"majorVersion\":1,\"minorVersion\":1,\"patchVersion\":4,\"runnable\":0,\"machineName\":\"H5PEditor.RadioGroup\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":12},\"author\":\"Joubel\",\"preloadedJs\":[{\"path\":\"radio-group.js\"}],\"preloadedCss\":[{\"path\":\"radio-group.css\"}]}"],"libraries\/H5P.TrueFalse-1.8\/library.json":["application\/json","{\"title\":\"True\\\/False Question\",\"description\":\"Test your users with 'True or False' type questions\",\"machineName\":\"H5P.TrueFalse\",\"majorVersion\":1,\"minorVersion\":8,\"patchVersion\":11,\"runnable\":1,\"license\":\"MIT\",\"author\":\"Joubel\",\"embedTypes\":[\"iframe\"],\"coreApi\":{\"majorVersion\":1,\"minorVersion\":19},\"preloadedCss\":[{\"path\":\"styles\\\/h5p-true-false.css\"}],\"preloadedJs\":[{\"path\":\"scripts\\\/h5p-true-false.js\"},{\"path\":\"scripts\\\/h5p-true-false-answer-group.js\"},{\"path\":\"scripts\\\/h5p-true-false-answer.js\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.Question\",\"majorVersion\":1,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.FontIcons\",\"majorVersion\":1,\"minorVersion\":0}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.RadioGroup\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.Video-1.6\/library.json":["application\/json","{\"machineName\":\"H5P.Video\",\"title\":\"Video\",\"contentType\":\"Media\",\"description\":\"Plays video from multiple sources.\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":6,\"patchVersion\":65,\"runnable\":0,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":19},\"preloadedJs\":[{\"path\":\"scripts\\\/vimeo.js\"},{\"path\":\"scripts\\\/youtube.js\"},{\"path\":\"scripts\\\/panopto.js\"},{\"path\":\"scripts\\\/echo360.js\"},{\"path\":\"scripts\\\/html5.js\"},{\"path\":\"scripts\\\/video.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/video.css\"}]}"],"libraries\/H5P.Table-1.2\/library.json":["application\/json","{\"title\":\"Table\",\"contentType\":\"Static content\",\"description\":\"Simple library that displays table.\",\"majorVersion\":1,\"minorVersion\":2,\"patchVersion\":2,\"runnable\":0,\"machineName\":\"H5P.Table\",\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":27},\"preloadedJs\":[{\"path\":\"scripts\\\/table.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/table.css\"}]}"],"libraries\/H5PEditor.Timecode-1.2\/library.json":["application\/json","{\"title\":\"Timecode Editor\",\"description\":\"Editor widget for timecodes\",\"majorVersion\":1,\"minorVersion\":2,\"patchVersion\":14,\"runnable\":0,\"machineName\":\"H5PEditor.Timecode\",\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":12},\"preloadedJs\":[{\"path\":\"timecode.js\"}],\"preloadedCss\":[{\"path\":\"timecode.css\"}]}"],"libraries\/H5P.GoToQuestion-1.3\/library.json":["application\/json","{\"machineName\":\"H5P.GoToQuestion\",\"title\":\"Crossroads\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":3,\"patchVersion\":15,\"runnable\":0,\"metadataSettings\":{\"disable\":1,\"disableExtraTitleField\":1},\"coreApi\":{\"majorVersion\":1,\"minorVersion\":6},\"preloadedJs\":[{\"path\":\"scripts\\\/go-to-question.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/go-to-question.css\"}],\"preloadedDependencies\":[{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.Timecode\",\"majorVersion\":1,\"minorVersion\":2}]}"],"libraries\/Shepherd-1.0\/library.json":["application\/json","{\"title\":\"Shepherd\",\"description\":\"Shepherd is a javascript library for guiding users through your app (http:\\\/\\\/github.hubspot.com\\\/shepherd)\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":7,\"runnable\":0,\"author\":\"Hubspot. Wrapped as H5P by Joubel (fnoks)\",\"license\":\"MIT\",\"machineName\":\"Shepherd\",\"preloadedJs\":[{\"path\":\"scripts\\\/tether.min.js\"},{\"path\":\"scripts\\\/tether.js\"},{\"path\":\"scripts\\\/shepherd.min.js\"},{\"path\":\"scripts\\\/shepherd.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/tether.min.css\"},{\"path\":\"styles\\\/shepherd-theme-arrows.css\"}]}"],"libraries\/H5P.GuidedTour-1.0\/library.json":["application\/json","{\"title\":\"Guided tour\",\"description\":\"Library for guiding users through an H5P. May be usable both by editors and standard H5P libraries\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":6,\"runnable\":0,\"author\":\"Joubel\",\"license\":\"MIT\",\"machineName\":\"H5P.GuidedTour\",\"preloadedJs\":[{\"path\":\"scripts\\\/h5p-guided-tour.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/h5p-guided-tour.css\"}],\"preloadedDependencies\":[{\"machineName\":\"Shepherd\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5PEditor.SelectToggleFields-1.1\/library.json":["application\/json","{\"machineName\":\"H5PEditor.SelectToggleFields\",\"title\":\"Toggle visibility of fields when selecting options in list\",\"license\":\"MIT\",\"author\":\"fnoks\",\"majorVersion\":1,\"minorVersion\":1,\"patchVersion\":1,\"runnable\":0,\"preloadedJs\":[{\"path\":\"select-toggle-fields.js\"}],\"preloadedCss\":[{\"path\":\"select-toggle-fields.css\"}]}"],"libraries\/H5P.IVHotspot-1.2\/library.json":["application\/json","{\"machineName\":\"H5P.IVHotspot\",\"title\":\"Navigation Hotspot\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":2,\"patchVersion\":17,\"runnable\":0,\"metadataSettings\":{\"disable\":1,\"disableExtraTitleField\":1},\"coreApi\":{\"majorVersion\":1,\"minorVersion\":6},\"preloadedJs\":[{\"path\":\"scripts\\\/iv-hotspot.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/iv-hotspot.css\"}],\"preloadedDependencies\":[{\"machineName\":\"H5P.Link\",\"majorVersion\":1,\"minorVersion\":3}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.Timecode\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5PEditor.ColorSelector\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5PEditor.UrlField\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5PEditor.SelectToggleFields\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0}]}"],"libraries\/H5P.Nil-1.0\/library.json":["application\/json","{\"title\":\"Label\",\"contentType\":\"H5P.Nil\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":14,\"runnable\":0,\"metadataSettings\":{\"disable\":1,\"disableExtraTitleField\":1},\"machineName\":\"H5P.Nil\",\"author\":\"Frode Petterson\"}"],"libraries\/H5P.Text-1.1\/library.json":["application\/json","{\"title\":\"Text\",\"contentType\":\"Static content\",\"description\":\"Simple library that displays text.\",\"majorVersion\":1,\"minorVersion\":1,\"patchVersion\":17,\"runnable\":0,\"machineName\":\"H5P.Text\",\"author\":\"Joubel\",\"preloadedJs\":[{\"path\":\"scripts\\\/text.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/text.css\"}],\"metadataSettings\":{\"disable\":0,\"disableExtraTitleField\":1}}"],"libraries\/H5PEditor.Duration-1.1\/library.json":["application\/json","{\"title\":\"H5PEditor.Duration\",\"majorVersion\":1,\"minorVersion\":1,\"patchVersion\":14,\"runnable\":0,\"machineName\":\"H5PEditor.Duration\",\"author\":\"Frode Petterson\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":24},\"preloadedJs\":[{\"path\":\"scripts\\\/duration.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/duration.css\"}]}"],"libraries\/H5P.CKEditor-1.0\/library.json":["application\/json","{\"machineName\":\"H5P.CKEditor\",\"title\":\"CKEditor wrapper\\\/loader for H5P\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":24,\"runnable\":0,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":27},\"preloadedJs\":[{\"path\":\"h5p-ckeditor.js\"}],\"preloadedCss\":[{\"path\":\"h5p-ckeditor.css\"}]}"],"libraries\/H5P.FreeTextQuestion-1.0\/library.json":["application\/json","{\"machineName\":\"H5P.FreeTextQuestion\",\"title\":\"Free Text Question\",\"license\":\"MIT\",\"author\":\"Joubel\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":16,\"runnable\":0,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":13},\"preloadedJs\":[{\"path\":\"h5p-free-text-question.js\"}],\"preloadedCss\":[{\"path\":\"h5p-free-text-question.css\"}],\"preloadedDependencies\":[{\"machineName\":\"H5P.CKEditor\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5}]}"],"libraries\/H5P.OpenEndedQuestion-1.0\/library.json":["application\/json","{\"title\":\"Open Ended Question\",\"description\":\"Create an open ended question\",\"majorVersion\":1,\"minorVersion\":0,\"patchVersion\":28,\"runnable\":0,\"author\":\"Joubel\",\"license\":\"MIT\",\"machineName\":\"H5P.OpenEndedQuestion\",\"preloadedJs\":[{\"path\":\"dist\\\/h5p-open-ended-question.js\"}],\"preloadedCss\":[{\"path\":\"dist\\\/h5p-open-ended-question.css\"}]}"],"libraries\/H5P.SimpleMultiChoice-1.1\/library.json":["application\/json","{\"title\":\"Simple Multi Choice\",\"description\":\"Create a simple multiple choice\",\"majorVersion\":1,\"minorVersion\":1,\"patchVersion\":22,\"runnable\":0,\"author\":\"thomasmars\",\"license\":\"MIT\",\"machineName\":\"H5P.SimpleMultiChoice\",\"preloadedJs\":[{\"path\":\"dist\\\/dist.js\"}],\"preloadedCss\":[{\"path\":\"dist\\\/styles.css\"}]}"],"libraries\/H5P.Questionnaire-1.3\/library.json":["application\/json","{\"title\":\"Questionnaire\",\"description\":\"Create a questionnaire\",\"majorVersion\":1,\"minorVersion\":3,\"patchVersion\":11,\"runnable\":1,\"author\":\"Joubel\",\"license\":\"MIT\",\"machineName\":\"H5P.Questionnaire\",\"embedTypes\":[\"iframe\"],\"preloadedJs\":[{\"path\":\"dist\\\/dist.js\"}],\"preloadedCss\":[{\"path\":\"dist\\\/styles.css\"}],\"preloadedDependencies\":[{\"machineName\":\"H5P.OpenEndedQuestion\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.SimpleMultiChoice\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5PEditor.VerticalTabs\",\"majorVersion\":1,\"minorVersion\":3}]}"],"libraries\/H5PEditor.InteractiveVideo-1.25\/library.json":["application\/json","{\"title\":\"Interactive Video Editor\",\"license\":\"MIT\",\"majorVersion\":1,\"minorVersion\":25,\"patchVersion\":11,\"runnable\":0,\"machineName\":\"H5PEditor.InteractiveVideo\",\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":27},\"preloadedJs\":[{\"path\":\"Scripts\\\/image-radio-button-group.js\"},{\"path\":\"Scripts\\\/interactive-video-editor.js\"},{\"path\":\"Scripts\\\/guided-tours.js\"},{\"path\":\"Scripts\\\/require-completion.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/image-radio-button-group.css\"},{\"path\":\"styles\\\/interactive-video-editor.css\"},{\"path\":\"styles\\\/require-completion.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.DragNBar\",\"majorVersion\":1,\"minorVersion\":5},{\"machineName\":\"H5P.Image\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5P.Audio\",\"majorVersion\":1,\"minorVersion\":5},{\"machineName\":\"H5P.Text\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5P.Table\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5P.Link\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.SingleChoiceSet\",\"majorVersion\":1,\"minorVersion\":11},{\"machineName\":\"H5P.MultiChoice\",\"majorVersion\":1,\"minorVersion\":16},{\"machineName\":\"H5P.TrueFalse\",\"majorVersion\":1,\"minorVersion\":8},{\"machineName\":\"H5P.Summary\",\"majorVersion\":1,\"minorVersion\":10},{\"machineName\":\"H5PEditor.Duration\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5PEditor.Timecode\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5PEditor.SelectToggleFields\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5PEditor.ColorSelector\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.Blanks\",\"majorVersion\":1,\"minorVersion\":14},{\"machineName\":\"H5P.Nil\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.DragQuestion\",\"majorVersion\":1,\"minorVersion\":14},{\"machineName\":\"H5P.MarkTheWords\",\"majorVersion\":1,\"minorVersion\":11},{\"machineName\":\"H5P.DragText\",\"majorVersion\":1,\"minorVersion\":10},{\"machineName\":\"H5P.GuidedTour\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.GoToQuestion\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.IVHotspot\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5P.Questionnaire\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.FontIcons\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.FreeTextQuestion\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.MultiMediaChoice\",\"majorVersion\":0,\"minorVersion\":3}]}"],"libraries\/H5P.InteractiveVideo-1.27\/library.json":["application\/json","{\"title\":\"Interactive Video\",\"description\":\"Put texts, tasks and other medias on top of your video.\",\"license\":\"MIT\",\"contentType\":\"Media\",\"majorVersion\":1,\"minorVersion\":27,\"patchVersion\":9,\"machineName\":\"H5P.InteractiveVideo\",\"author\":\"Joubel\",\"embedTypes\":[\"iframe\"],\"runnable\":1,\"fullscreen\":1,\"coreApi\":{\"majorVersion\":1,\"minorVersion\":27},\"preloadedJs\":[{\"path\":\"dist\\\/h5p-interactive-video.js\"}],\"preloadedCss\":[{\"path\":\"dist\\\/h5p-interactive-video.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"jQuery.ui\",\"majorVersion\":1,\"minorVersion\":10},{\"machineName\":\"H5P.Video\",\"majorVersion\":1,\"minorVersion\":6},{\"machineName\":\"H5P.DragNBar\",\"majorVersion\":1,\"minorVersion\":5}],\"editorDependencies\":[{\"machineName\":\"H5P.InteractiveVideo\",\"majorVersion\":1,\"minorVersion\":27},{\"machineName\":\"H5PEditor.Wizard\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5PEditor.InteractiveVideo\",\"majorVersion\":1,\"minorVersion\":25}]}"],"libraries\/H5PEditor.CoursePresentation-1.25\/library.json":["application\/json","{\"title\":\"Course Presentation Editor\",\"majorVersion\":1,\"minorVersion\":25,\"patchVersion\":14,\"runnable\":0,\"machineName\":\"H5PEditor.CoursePresentation\",\"author\":\"Joubel\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":27},\"preloadedJs\":[{\"path\":\"scripts\\\/disposable-boolean.js\"},{\"path\":\"scripts\\\/cp-editor.js\"},{\"path\":\"scripts\\\/slide-selector.js\"},{\"path\":\"scripts\\\/bg-selector.js\"}],\"preloadedCss\":[{\"path\":\"styles\\\/cp-editor.css\"},{\"path\":\"styles\\\/slide-selector.css\"},{\"path\":\"styles\\\/bg-selector.css\"},{\"path\":\"styles\\\/toolbar.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.DragNBar\",\"majorVersion\":1,\"minorVersion\":5},{\"machineName\":\"H5P.Image\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5P.Shape\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.AdvancedText\",\"majorVersion\":1,\"minorVersion\":1},{\"machineName\":\"H5P.Link\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.ContinuousText\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5P.Table\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5P.Video\",\"majorVersion\":1,\"minorVersion\":6},{\"machineName\":\"H5P.Audio\",\"majorVersion\":1,\"minorVersion\":5},{\"machineName\":\"H5P.Blanks\",\"majorVersion\":1,\"minorVersion\":14},{\"machineName\":\"H5P.SingleChoiceSet\",\"majorVersion\":1,\"minorVersion\":11},{\"machineName\":\"H5P.MultiChoice\",\"majorVersion\":1,\"minorVersion\":16},{\"machineName\":\"H5P.TrueFalse\",\"majorVersion\":1,\"minorVersion\":8},{\"machineName\":\"H5P.DragQuestion\",\"majorVersion\":1,\"minorVersion\":14},{\"machineName\":\"H5P.Summary\",\"majorVersion\":1,\"minorVersion\":10},{\"machineName\":\"H5P.ExportableTextArea\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.InteractiveVideo\",\"majorVersion\":1,\"minorVersion\":27},{\"machineName\":\"H5P.MarkTheWords\",\"majorVersion\":1,\"minorVersion\":11},{\"machineName\":\"H5P.DragText\",\"majorVersion\":1,\"minorVersion\":10},{\"machineName\":\"H5P.TwitterUserFeed\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.Dialogcards\",\"majorVersion\":1,\"minorVersion\":9},{\"machineName\":\"H5P.AudioRecorder\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.ColorSelector\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5PEditor.RadioSelector\",\"majorVersion\":1,\"minorVersion\":2},{\"machineName\":\"H5P.FontIcons\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5P.MultiMediaChoice\",\"majorVersion\":0,\"minorVersion\":3}]}"],"libraries\/H5P.CoursePresentation-1.26\/library.json":["application\/json","{\"title\":\"Course Presentation\",\"contentType\":\"Library\",\"majorVersion\":1,\"minorVersion\":26,\"patchVersion\":3,\"runnable\":1,\"fullscreen\":1,\"embedTypes\":[\"iframe\"],\"machineName\":\"H5P.CoursePresentation\",\"author\":\"Joubel\",\"license\":\"MIT\",\"coreApi\":{\"majorVersion\":1,\"minorVersion\":27},\"preloadedJs\":[{\"path\":\"dist\\\/h5p-course-presentation.js\"}],\"preloadedCss\":[{\"path\":\"dist\\\/h5p-course-presentation.css\"}],\"preloadedDependencies\":[{\"machineName\":\"FontAwesome\",\"majorVersion\":4,\"minorVersion\":5},{\"machineName\":\"H5P.JoubelUI\",\"majorVersion\":1,\"minorVersion\":3},{\"machineName\":\"H5P.FontIcons\",\"majorVersion\":1,\"minorVersion\":0}],\"editorDependencies\":[{\"machineName\":\"H5P.CoursePresentation\",\"majorVersion\":1,\"minorVersion\":26},{\"machineName\":\"H5PEditor.ShowWhen\",\"majorVersion\":1,\"minorVersion\":0},{\"machineName\":\"H5PEditor.CoursePresentation\",\"majorVersion\":1,\"minorVersion\":25}]}"]});		H5PIntegration	= (function(x){
			let url	= window.location.href.split('/');
			url.pop();
			x.url	= url.join('/');
			return x;
		})({"baseUrl":"","url":"","siteUrl":"","l10n":{"H5P":{"fullscreen":"Vollbild","disableFullscreen":"Kein Vollbild","download":"Download","copyrights":"Nutzungsrechte","embed":"Einbetten","size":"Size","showAdvanced":"Show advanced","hideAdvanced":"Hide advanced","advancedHelp":"Include this script on your website if you want dynamic sizing of the embedded content:","copyrightInformation":"Nutzungsrechte","close":"Schlie\u00dfen","title":"Titel","author":"Autor","year":"Jahr","source":"Quelle","license":"Lizenz","thumbnail":"Thumbnail","noCopyrights":"Keine Copyright-Informationen vorhanden","reuse":"Wiederverwenden","reuseContent":"Verwende Inhalt","reuseDescription":"Verwende Inhalt.","downloadDescription":"Lade den Inhalt als H5P-Datei herunter.","copyrightsDescription":"Zeige Urheberinformationen an.","embedDescription":"Zeige den Code f\u00fcr die Einbettung an.","h5pDescription":"Visit H5P.org to check out more cool content.","contentChanged":"Dieser Inhalt hat sich seit Ihrer letzten Nutzung ver\u00e4ndert.","startingOver":"Sie beginnen von vorne.","by":"von","showMore":"Zeige mehr","showLess":"Zeige weniger","subLevel":"Sublevel","confirmDialogHeader":"Best\u00e4tige Aktion","confirmDialogBody":"Please confirm that you wish to proceed. This action is not reversible.","cancelLabel":"Abbrechen","confirmLabel":"Best\u00e4tigen","licenseU":"Undisclosed","licenseCCBY":"Attribution","licenseCCBYSA":"Attribution-ShareAlike","licenseCCBYND":"Attribution-NoDerivs","licenseCCBYNC":"Attribution-NonCommercial","licenseCCBYNCSA":"Attribution-NonCommercial-ShareAlike","licenseCCBYNCND":"Attribution-NonCommercial-NoDerivs","licenseCC40":"4.0 International","licenseCC30":"3.0 Unported","licenseCC25":"2.5 Generic","licenseCC20":"2.0 Generic","licenseCC10":"1.0 Generic","licenseGPL":"General Public License","licenseV3":"Version 3","licenseV2":"Version 2","licenseV1":"Version 1","licensePD":"Public Domain","licenseCC010":"CC0 1.0 Universal (CC0 1.0) Public Domain Dedication","licensePDM":"Public Domain Mark","licenseC":"Copyright","contentType":"Inhaltstyp","licenseExtras":"License Extras","changes":"Changelog","contentCopied":"Inhalt wurde ins Clipboard kopiert","connectionLost":"Connection lost. Results will be stored and sent when you regain connection.","connectionReestablished":"Connection reestablished.","resubmitScores":"Attempting to submit stored results.","offlineDialogHeader":"Your connection to the server was lost","offlineDialogBody":"We were unable to send information about your completion of this task. Please check your internet connection.","offlineDialogRetryMessage":"Versuche es wieder in :num....","offlineDialogRetryButtonLabel":"Jetzt nochmal probieren","offlineSuccessfulSubmit":"Erfolgreich Ergebnisse gesendet."}},"hubIsEnabled":false,"reportingIsEnabled":false,"libraryConfig":null,"crossorigin":null,"crossoriginCacheBuster":null,"pluginCacheBuster":"","libraryUrl":".\/libraries\/h5pcore\/js","contents":{"cid-1292457956431781089-template-course-presentation-1292624314740691359":{"displayOptions":{"copy":false,"copyright":false,"embed":false,"export":false,"frame":false,"icon":false},"embedCode":"","exportUrl":false,"fullScreen":false,"contentUserData":[],"metadata":{"title":"How to explore SDGs research in SciVal","license":"U"},"library":"H5P.CoursePresentation 1.26","jsonContent":"{\"presentation\":{\"slides\":[{\"elements\":[{\"x\":0,\"y\":0,\"width\":99.99646118721462,\"height\":99.99639208152092,\"action\":{\"library\":\"H5P.Image 1.1\",\"params\":{\"decorative\":false,\"contentName\":\"Image\",\"expandImage\":\"Expand Image\",\"minimizeImage\":\"Minimize Image\",\"alt\":\"step1\",\"file\":{\"path\":\"images\\\/file-685df7144d1d3.png\",\"mime\":\"image\\\/png\",\"copyright\":{\"license\":\"U\"},\"width\":1906,\"height\":905},\"title\":\"1.\\tAt the top-left corner, click \\u201cSelect entity\\u201d, then choose \\u201cInstitutions\\u2019, click \\u201cHong Kong University of Science and Technology\\u201d\"},\"subContentId\":\"c5732d07-19b2-44fb-b20e-10c2dcadeb92\",\"metadata\":{\"contentType\":\"Image\",\"license\":\"U\",\"title\":\"Untitled Image\"}},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"},{\"x\":0,\"y\":38.3305259217668,\"width\":10.272191780821917,\"height\":4.502862657818247,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"rgba(255, 255, 255, 0)\",\"borderWidth\":\"2\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(250, 0, 0)\",\"borderRadius\":\"2\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"subContentId\":\"d8b3c9e7-eaa1-4754-a9f0-c9ea28f40541\",\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"}},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":19.406392694063925,\"y\":27.048790332582435,\"width\":46.800114155251144,\"height\":18.039592395409827,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"#fff\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(13, 1, 1)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"subContentId\":\"15161bf6-3922-4e70-afde-dac43c03ca6e\",\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"}},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":19.40639269406393,\"y\":25.255429353573756,\"width\":46.800114155251144,\"height\":18.039592395409827,\"action\":{\"library\":\"H5P.AdvancedText 1.1\",\"params\":{\"text\":\"<ol><li>At the top-left corner, click \\u201c<strong>Select entity<\\\/strong>\\u201d, then choose \\u201c<strong>Institutions<\\\/strong>\\u2019, click \\u201c<strong>Hong Kong University of Science and Technology<\\\/strong>\\u201d<\\\/li><\\\/ol>\"},\"subContentId\":\"08dba59d-c291-4717-97e9-a42f1f5895f2\",\"metadata\":{\"contentType\":\"Text\",\"license\":\"U\",\"title\":\"Untitled Text\"}},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"}],\"slideBackgroundSelector\":{}},{\"elements\":[{\"x\":0,\"y\":0,\"width\":100.02146118721461,\"height\":100,\"action\":{\"library\":\"H5P.Image 1.1\",\"params\":{\"decorative\":false,\"contentName\":\"Image\",\"expandImage\":\"Expand Image\",\"minimizeImage\":\"Minimize Image\",\"alt\":\"Step 2\",\"file\":{\"path\":\"images\\\/file-685df93f6014c.png\",\"mime\":\"image\\\/png\",\"copyright\":{\"license\":\"U\"},\"width\":1392,\"height\":716}},\"subContentId\":\"55b5a648-551c-4268-aff4-0ffd2d17f8d2\",\"metadata\":{\"contentType\":\"Image\",\"license\":\"U\",\"title\":\"Untitled Image\"}},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"},{\"x\":1.139769406392694,\"y\":94.7042521574225,\"width\":6.847534246575343,\"height\":5.270943403033809,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"rgba(255, 255, 255, 0)\",\"borderWidth\":\"3\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(244, 5, 5)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"subContentId\":\"28e2fbfe-e0ea-438c-97f5-2edf50f2d5e3\",\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"}},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":1.1415525114155252,\"y\":18.039592395409827,\"width\":12.553538812785387,\"height\":7.515316741418228,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"rgba(255, 255, 255, 0)\",\"borderWidth\":\"3\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(244, 5, 5)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"},\"subContentId\":\"b19e3cfa-927c-4752-9316-e6abc1f9f98d\"},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":19.406392694063925,\"y\":27.048790332582435,\"width\":46.800114155251144,\"height\":18.039592395409827,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"#fff\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(13, 1, 1)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"},\"subContentId\":\"fcc510c2-2fc8-4d7a-8328-c5ff64090bb8\"},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":20.547945205479454,\"y\":29.31433764254097,\"width\":45.65856164383562,\"height\":15.784643345983598,\"action\":{\"library\":\"H5P.AdvancedText 1.1\",\"params\":{\"text\":\"<p>2. Select the <strong>timeframe<\\\/strong> (e.g., 2020-2024, 2015-2024, etc), and select <strong>SDGs<\\\/strong> from Research Fields, select the <strong>Scholarly Output<\\\/strong>.<\\\/p>\"},\"metadata\":{\"contentType\":\"Text\",\"license\":\"U\",\"title\":\"Untitled Text\"},\"subContentId\":\"a4362faf-d791-4f02-947a-35cdb524512f\"},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"},{\"x\":84.47488584474885,\"y\":63.13857338393439,\"width\":11.411963470319636,\"height\":7.511799020901123,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"rgba(255, 255, 255, 0)\",\"borderWidth\":\"3\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(244, 5, 5)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"},\"subContentId\":\"21ead358-13f5-4ff6-adf3-ccfa32f6396e\"},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false}],\"slideBackgroundSelector\":{}},{\"elements\":[{\"x\":0,\"y\":0,\"width\":99.8912100456621,\"height\":100,\"action\":{\"library\":\"H5P.Image 1.1\",\"params\":{\"decorative\":false,\"contentName\":\"Image\",\"expandImage\":\"Expand Image\",\"minimizeImage\":\"Minimize Image\",\"file\":{\"path\":\"images\\\/file-685dfbc0e2f3f.png\",\"mime\":\"image\\\/png\",\"copyright\":{\"license\":\"U\"},\"width\":1599,\"height\":815},\"alt\":\"Step 3.\"},\"subContentId\":\"6bb2c26f-9dc5-49f8-9099-f6c6ecc07092\",\"metadata\":{\"contentType\":\"Image\",\"license\":\"U\",\"title\":\"Untitled Image\"}},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"},{\"x\":21.689497716894977,\"y\":29.307347300487745,\"width\":46.800114155251144,\"height\":13.526176576040266,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"#fff\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(13, 1, 1)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"},\"subContentId\":\"d390b3b1-e37d-4e1d-9a39-5c939f379f1b\"},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":22.831050228310502,\"y\":31.56229634991397,\"width\":44.51872146118721,\"height\":13.52265885552316,\"action\":{\"library\":\"H5P.AdvancedText 1.1\",\"params\":{\"text\":\"<p>3. After clicking the number on Scholarly Output, a box will be pop up. Then, click<strong> Export Spreadsheet<\\\/strong><\\\/p>\"},\"metadata\":{\"contentType\":\"Text\",\"license\":\"U\",\"title\":\"Untitled Text\"},\"subContentId\":\"6c5096b9-b97e-4ac8-89a3-91f61119c270\"},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"},{\"x\":84.47488584474885,\"y\":15.78112562546649,\"width\":12.553538812785387,\"height\":7.508281300384018,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"rgba(255, 255, 255, 0)\",\"borderWidth\":\"3\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(244, 5, 5)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"},\"subContentId\":\"2057c529-7a88-4ee6-b6fc-e1637dd4ca81\"},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false}],\"slideBackgroundSelector\":{}},{\"elements\":[{\"x\":0,\"y\":0,\"width\":99.99817351598175,\"height\":100,\"action\":{\"library\":\"H5P.Image 1.1\",\"params\":{\"decorative\":false,\"contentName\":\"Image\",\"expandImage\":\"Expand Image\",\"minimizeImage\":\"Minimize Image\",\"alt\":\"Step 4\",\"file\":{\"path\":\"images\\\/file-685dfd7e5a29f.png\",\"mime\":\"image\\\/png\",\"copyright\":{\"license\":\"U\"},\"width\":1286,\"height\":732}},\"subContentId\":\"3441ce11-e808-4cad-ba85-f1a4cb3e7b8c\",\"metadata\":{\"contentType\":\"Image\",\"license\":\"U\",\"title\":\"Untitled Image\"}},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"},{\"x\":20.547945205479454,\"y\":42.844031939098336,\"width\":18.264840182648403,\"height\":7.501223309859314,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"rgba(255, 255, 255, 0)\",\"borderWidth\":\"3\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(244, 5, 5)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"},\"subContentId\":\"7b258d5e-2e66-4577-86bb-362a423bfc01\"},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":42.23744292237443,\"y\":36.07918479081965,\"width\":50.22648401826484,\"height\":18.039592395409827,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"#fff\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(13, 1, 1)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"},\"subContentId\":\"e30c9bff-db70-4819-8490-84c2066fdf63\"},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":43.37899543378995,\"y\":38.327143498192655,\"width\":51.36632420091324,\"height\":15.784643345983598,\"action\":{\"library\":\"H5P.AdvancedText 1.1\",\"params\":{\"text\":\"<p>4. From the exported option, select \\u201c<strong>Sustainable Development Goals (2023<\\\/strong>)\\u201d under <strong>Publication details.&nbsp;<\\\/strong> You can select the <strong>ASJC <\\\/strong>for comparision if you want.<\\\/p>\"},\"metadata\":{\"contentType\":\"Text\",\"license\":\"U\",\"title\":\"Untitled Text\"},\"subContentId\":\"79cd141d-ddc1-480f-b943-c0092d45b8d4\"},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"}],\"slideBackgroundSelector\":{}},{\"elements\":[{\"x\":0,\"y\":0,\"width\":99.99646118721462,\"height\":100,\"action\":{\"library\":\"H5P.Image 1.1\",\"params\":{\"decorative\":false,\"contentName\":\"Image\",\"expandImage\":\"Expand Image\",\"minimizeImage\":\"Minimize Image\",\"alt\":\"Step 5\",\"file\":{\"path\":\"images\\\/file-685dff8c64638.png\",\"mime\":\"image\\\/png\",\"copyright\":{\"license\":\"U\"},\"width\":1276,\"height\":584}},\"subContentId\":\"2eb5222e-7ba8-4ad2-aea3-b382aacbb022\",\"metadata\":{\"contentType\":\"Image\",\"license\":\"U\",\"title\":\"Untitled Image\"}},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"},{\"x\":76.48401826484019,\"y\":0,\"width\":23.514155251141553,\"height\":100,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"rgba(255, 255, 255, 0)\",\"borderWidth\":\"3\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(244, 5, 5)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"},\"subContentId\":\"c4f0c365-1b71-470a-a182-de8199514cc4\"},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":25.11415525114155,\"y\":22.538914783220477,\"width\":49.083219178082196,\"height\":9.019796197704913,\"action\":{\"library\":\"H5P.Shape 1.0\",\"params\":{\"shape\":{\"fillColor\":\"#fff\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\",\"borderColor\":\"rgb(13, 1, 1)\",\"borderRadius\":\"3\"},\"type\":\"rectangle\",\"line\":{\"borderColor\":\"#000000\",\"borderWidth\":\"1\",\"borderStyle\":\"solid\"}},\"metadata\":{\"contentType\":\"Shapes\",\"license\":\"U\"},\"subContentId\":\"2ecc8d1b-e9e8-45c4-a1e6-d89396cb299e\"},\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false},{\"x\":26.25570776255708,\"y\":24.804439543688513,\"width\":51.36632420091324,\"height\":15.784643345983598,\"action\":{\"library\":\"H5P.AdvancedText 1.1\",\"params\":{\"text\":\"<p>5. You can now see how each article is mapped to <strong>SDGs<\\\/strong><\\\/p>\"},\"metadata\":{\"contentType\":\"Text\",\"license\":\"U\",\"title\":\"Untitled Text\"},\"subContentId\":\"08847b54-013b-453c-ac86-24760bc9013a\"},\"alwaysDisplayComments\":false,\"backgroundOpacity\":0,\"displayAsButton\":false,\"buttonSize\":\"big\",\"goToSlideType\":\"specified\",\"invisible\":false,\"solution\":\"\"}],\"slideBackgroundSelector\":{}}],\"keywordListEnabled\":true,\"globalBackgroundSelector\":{},\"keywordListAlwaysShow\":false,\"keywordListAutoHide\":false,\"keywordListOpacity\":90},\"override\":{\"activeSurface\":false,\"hideSummarySlide\":false,\"summarySlideSolutionButton\":true,\"summarySlideRetryButton\":true,\"enablePrintButton\":false,\"social\":{\"showFacebookShare\":false,\"facebookShare\":{\"url\":\"@currentpageurl\",\"quote\":\"I scored @score out of @maxScore on a task at @currentpageurl.\"},\"showTwitterShare\":false,\"twitterShare\":{\"statement\":\"I scored @score out of @maxScore on a task at @currentpageurl.\",\"url\":\"@currentpageurl\",\"hashtags\":\"h5p, course\"},\"showGoogleShare\":false,\"googleShareUrl\":\"@currentpageurl\"}},\"l10n\":{\"slide\":\"Slide\",\"score\":\"Score\",\"yourScore\":\"Your Score\",\"maxScore\":\"Max Score\",\"total\":\"Total\",\"totalScore\":\"Total Score\",\"showSolutions\":\"Show solutions\",\"retry\":\"Retry\",\"exportAnswers\":\"Export text\",\"hideKeywords\":\"Hide sidebar navigation menu\",\"showKeywords\":\"Show sidebar navigation menu\",\"fullscreen\":\"Fullscreen\",\"exitFullscreen\":\"Exit fullscreen\",\"prevSlide\":\"Previous slide\",\"nextSlide\":\"Next slide\",\"currentSlide\":\"Current slide\",\"lastSlide\":\"Last slide\",\"solutionModeTitle\":\"Exit solution mode\",\"solutionModeText\":\"Solution Mode\",\"summaryMultipleTaskText\":\"Multiple tasks\",\"scoreMessage\":\"You achieved:\",\"shareFacebook\":\"Share on Facebook\",\"shareTwitter\":\"Share on Twitter\",\"shareGoogle\":\"Share on Google+\",\"summary\":\"Summary\",\"solutionsButtonTitle\":\"Show comments\",\"printTitle\":\"Print\",\"printIngress\":\"How would you like to print this presentation?\",\"printAllSlides\":\"Print all slides\",\"printCurrentSlide\":\"Print current slide\",\"noTitle\":\"No title\",\"accessibilitySlideNavigationExplanation\":\"Use left and right arrow to change slide in that direction whenever canvas is selected.\",\"accessibilityCanvasLabel\":\"Presentation canvas. Use left and right arrow to move between slides.\",\"accessibilityProgressBarLabel\":\"Choose slide to display\",\"containsNotCompleted\":\"@slideName contains not completed interaction\",\"containsCompleted\":\"@slideName contains completed interaction\",\"slideCount\":\"Slide @index of @total\",\"containsOnlyCorrect\":\"@slideName only has correct answers\",\"containsIncorrectAnswers\":\"@slideName has incorrect answers\",\"shareResult\":\"Share Result\",\"accessibilityTotalScore\":\"You got @score of @maxScore points in total\",\"accessibilityEnteredFullscreen\":\"Entered fullscreen\",\"accessibilityExitedFullscreen\":\"Exited fullscreen\",\"confirmDialogHeader\":\"Submit your answers\",\"confirmDialogText\":\"This will submit your results, do you want to continue?\",\"confirmDialogConfirmText\":\"Submit and see results\",\"slideshowNavigationLabel\":\"Slideshow navigation\",\"confirmDialogConfirmLabel\":\"Confirm\",\"confirmDialogCancelLabel\":\"Cancel\"}}"}}});