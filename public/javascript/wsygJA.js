//WSYJA
(function (window) {
    /**
     **  To use start with the 'init(conatiner_id/container_class)'
     **
     **/
    // You can enable the strict mode commenting the following line  
    //'use strict';

    // Main library 
    function myLibrary() {
        let _myLibraryObject = {};
        //  Private variables
        let defaults = {
            container: null,
            descriptionText: null,
            html: `<div id="code-editor">
                <div class="editor-block-controls">
                  <div>
                      <button class="command" title="Undo" data-command='undo'><i class="fas fa-undo"></i></button>
                      <button class="command" title="Redo" data-command='redo'><i class="fas fa-redo"></i></button>
                  </div>
                  <div>
                    <button class="command" title="Title" data-command='italic'><i class="fas fa-italic"></i></button>
                    <button class="command" title="Bold" data-command='bold'><i class="fas fa-bold"></i></button>
                    <button class="command" title="Underline" data-command='underline'>U</button>
                    <button class="command" title="Insert Horizontal Line" data-command="insertHorizontalRule">Hr</button>
                    <button class='command' title="Strike-Through" data-command='strikethrough'><strike>abc</strike></button>
                    <button class="command" title="H1" data-command='h1'>H1</button>
                    <button class="command" title="H2" data-command='h2'>H2</button>
                    <button  class="command" title="Paragraph" data-command="p"><i class="fas fa-paragraph"></i></button>
                  </div>
                  <div>
                    <button  class="command" title="Indent" data-command="indent"><i class="fas fa-indent"></i></button>
                    <button  class="command" title="Outdent" data-command="outdent"><i class="fas fa-outdent"></i></button>
                  </div>
                  <div>
                    <button class="command" title="Justify-Left" data-command='justifyleft'><i class="fas fa-align-left"></i></button>
                    <button class="command" title="Justify-Center" data-command='justifycenter'><i class="fas fa-align-justify"></i></button>
                    <button class="command" title="Justify-Right" data-command='justifyright'><i class="fas fa-align-right"></i></button>
                  </div>
                </div>
                <div class="editor-block-controls">
                  <div>
                     <button class="command" title="Blockquote" data-command='formatBlock'><i class="fas fa-quote-right"></i></button>
                    <button class="command" title="Superscript" data-command='superscript'>A<sup>abc</sup></button>
                    <button class="command" title="Blockquote" data-command='subscript'>A<sub>abc</sub></button>
                  </div>
                  <div>
                    <button class="command" title="Decrease font" data-command='decreasefontsize'><sub>A</sub></button>
                    <button class="command" title="Increase font" data-command='increasefontsize'><i class="fas fa-font"></i></button>
                  </div>
                  <div>
                    <select class="wsy-command" title="Font size">
                      <option value="1">small</option>
                      <option value="2">normal</option>
                      <option value="3">medium</option>
                      <option value="4">large</option>
                      <option value="5">x-large</option>
                      <option value="6">xx-large</option>
                      <option value="7">xxx-large</option>
                    </select>
                  </div>
                </div>
              <div id="editor-block-content" contenteditable></div>
              </div>`
        };

        // Methods of myLibrary
        _myLibraryObject.init = function (container) {
            defaults.container = document.querySelector(container);
            defaults.descriptionText = defaults.container.innerHTML;
            _myLibraryObject.setUI();
            _myLibraryObject.setListeners();
            return defaults.container;
        };

        _myLibraryObject.setUI = function () {
            if (defaults.container !== null && defaults.container) {
                defaults.container.innerHTML = defaults.html;
                document.querySelector('#editor-block-content').innerHTML = defaults.descriptionText;
            }

        };

        _myLibraryObject.setListeners = function () {
            for (let el of defaults.container.querySelectorAll('button.command')) {
                el.addEventListener('mousedown', function (e) {
                    let command = e.currentTarget.getAttribute('data-command');
                    switch (command) {
                        case 'h1':
                        case 'h2':
                        case 'p':
                            document.execCommand('formatBlock', false, command);
                            break;
                        case 'formatBlock':
                            document.execCommand('formatBlock', false, "blockquote");
                            break;
                        case 'increasefontsize':
                            document.execCommand('fontSize', false, 5);
                            break;
                        case 'decreasefontsize':
                            document.execCommand('fontSize', false, 2);
                            break;
                        default:
                            document.execCommand(command, false, command);
                            break;
                    }
                });
            }
            defaults.container.querySelector('select').addEventListener('change', (e) => {
                document.execCommand('fontSize', false, e.target.value);
            });

        };

        _myLibraryObject.getTextContent = function () {
            return defaults.container.querySelector('#editor-block-content').innerHTML;
        };

        _myLibraryObject.getTextBox = function () {
            return defaults.container.querySelector('#editor-block-content');
        };


        return _myLibraryObject;
    }

    // We need that our library is globally accesible, then we save in the window
    if (typeof (window.wsyJA) === 'undefined') {
        window.wsyJA = myLibrary();
    }
})(window);

/**
 * TIMER
 * To use : add the date object to the function [new Date("jan 9, 2018 14:08").getTime()]
 */
function countdownTimerEvent(dateTo) {
    let interval = setInterval(function (dateTo) {
        let timeNow = new Date().getTime();
        let timeLeft = dateTo - timeNow;
        // Time calculations for days, hours, minutes and seconds
        let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        // Execute this code
        console.log({
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        });
        if (timeLeft < 0) {
            // Timer ran out
            clearInterval(interval);
            console.log('DONE!!!');
        }
    }, 1000, dateTo);
}