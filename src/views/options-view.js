var $ = jQuery = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.sync = require('backbone-indexeddb').sync;
require('../bootstrap-modal.js');
var Inbox = require('../models/inbox.js').Inbox;

var OptionsView = Backbone.View.extend({
    events: {
        "change #relevance": "adjustRelevance",
        "click #resetRusbcriptions": "resetRusbcriptions",
        "click #pinMsgboy": "pinMsgboy",
        "click #msgboySubscribeHandler": "registerHandler",
        "change #autoRefresh": "setAutoRefresh"
    },

    initialize: function () {
        _.bindAll(this, "render", "adjustRelevance", "resetRusbcriptions", "pinMsgboy", "saveModel", "registerHandler", "setAutoRefresh");
        this.model = new Inbox();
        this.model.bind("change", function () {
            this.render();
            chrome.extension.sendRequest({
                signature: "reload",
                params: {}
            });
        }.bind(this));
        this.model.fetch();
    },

    render: function () {
        this.$("#relevance").val((1 - this.model.attributes.options.relevance) * 100);
        if(this.model.attributes.options.pinMsgboy) {
            this.$("#pinMsgboy").val("pinned");
            this.$("#pinMsgboy").html("Unpin");
        }
        else {
            this.$("#pinMsgboy").val("unpinned");
            this.$("#pinMsgboy").html("Pin");
        }
        if(this.model.attributes.options.autoRefresh) {
            this.$("#autoRefresh").prop("checked", true);
        }
    },

    adjustRelevance: function (event) {
        this.saveModel();
    },

    resetRusbcriptions: function (event) {
        var modalHtml = [
        '<div id="modal-options" class="modal backdrop fade">',
            '<div class="modal-header">',
                '<button class="close" data-dismiss="modal">×</button>',
                '<h3>Reset Subscriptions</h3>',
            '</div>',
            '<div class="modal-body">',
                '<p>Your subscriptions are being imported again. Please bear with us, as it may take a couple minutes.</p>',
            '</div>',
            '<div class="modal-footer">',
            '</div>',
        '</div>'
        ].join('');
        var modal = $(modalHtml);
        modal.appendTo(document.body);
        modal.on('hidden', function () {
            modal.remove();
        });
        modal.modal('show');
    },
    
    pinMsgboy: function(event) {
        if(this.$("#pinMsgboy").val() === "unpinned") {
            this.$("#pinMsgboy").val("pinned");
        }
        else {
            this.$("#pinMsgboy").val("unpinned");
        }
        this.saveModel();
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.update(tab.id, {pinned: this.$("#pinMsgboy").val() === "pinned"}, function() {
                // Done
            }.bind(this))
        }.bind(this));
    },
    
    saveModel: function() {
        var attributes = {};
        attributes.options = {};
        attributes.options['pinMsgboy'] = this.$("#pinMsgboy").val() === "pinned";
        attributes.options['relevance'] = 1 - this.$("#relevance").val() / 100;
        attributes.options['autoRefresh'] = this.$("#autoRefresh").is(':checked');
        this.model.set(attributes);
        this.model.save();
    },
    
    registerHandler: function() {
        // Protocol Handler Registration
        var u =  chrome.extension.getURL("/views/html/subscribe.html?uri=%s");
        var res = window.navigator.registerProtocolHandler("web+subscribe", u, "Msgboy");
    },
    
    setAutoRefresh: function() {
        this.saveModel();
    }
});

exports.OptionsView = OptionsView;
