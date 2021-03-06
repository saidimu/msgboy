var _ = require('underscore');
var should = require('chai').should();
var Plugins = require('../plugins.js').Plugins;

describe('Plugins', function(){
    before(function(ready) {
        ready();
    });
    
    beforeEach(function(ready) {
        ready();
    });
    
    describe('importSubscriptions', function() {
        beforeEach(function(ready) {
            Plugins.all = [];
            Plugins.register({
                listSubscriptions: function(cb, done) {
                    cb({url: "url1", title: "title1"});
                    cb({url: 'url2', title: "title2"});
                    cb({url: 'url3', title: "title3"});
                    done(3)
                },
                name: "Stub 1"
            });
            Plugins.register({
                listSubscriptions: function(cb, done) {
                    cb({url: "url4", title: "title4"});
                    cb({url: 'url5', title: "title5"});
                    done(2)
                },
                name: "Stub 2"
            });
            ready();
        });
        it('should listSubscriptions for each plugin', function(done) {
            var subscriptionsUrls = []
            Plugins.importSubscriptions(function(sub) {
                subscriptionsUrls.push(sub.url)
            }, function() {
    
            }, function(count) {
                if(count === 5) {
                    subscriptionsUrls.should.include('url1');
                    subscriptionsUrls.should.include('url2');
                    subscriptionsUrls.should.include('url3');
                    subscriptionsUrls.should.include('url4');
                    subscriptionsUrls.should.include('url5');
                    done();
                }
            });
        });
    });
    
    
    require('./plugins/google-reader.js');
    require('./plugins/blogger.js');
    require('./plugins/bookmarks.js');
    require('./plugins/disqus.js');
    require('./plugins/generic.js');
    require('./plugins/history.js');
    require('./plugins/posterous.js');
    require('./plugins/statusnet.js');
    require('./plugins/tumblr.js');
    require('./plugins/typepad.js');
    require('./plugins/wordpress.js');
    
});