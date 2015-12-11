'use strict';

var router = require('express').Router(),
	_ = require('lodash');

var HttpError = require('../../utils/HttpError');
var Story = require('./story.model');

router.param('id', function (req, res, next, id) {
	Story.findById(id).exec()
	.then(function (story) {
		if (!story) throw HttpError(404);
		req.story = story;
		next();
	})
	.then(null, next);
});

router.get('/', function (req, res, next) {
	Story.find({}).populate('author').exec()
	.then(function (stories) {
		res.json(stories);
	})
	.then(null, next);
});

router.post('/', function (req, res, next) {
	if ( req.user === undefined ) return res.status(401).end();
	if ( req.body.author._id !== req.user._id ) return res.status(401).end();
	Story.create(req.body)
	.then(function (story) {
		return story.populateAsync('author');
	})
	.then(function (populated) {
		res.status(201).json(populated);
	})
	.then(null, next);
});

router.get('/:id', function (req, res, next) {
	req.story.populateAsync('author')
	.then(function (story) {
		res.json(story);
	})
	.then(null, next);
});

router.put('/:id', function (req, res, next) {
	if ( req.user === undefined ) return res.status(401).end();
	if ( !( req.user._id === req.story.author._id || req.user.isAdmin ) ) return res.status(401).end();
	if ( req.body.author && !req.user.isAdmin ) return res.status(401).end();
	_.extend(req.story, req.body);
	req.story.save()
	.then(function (story) {
		res.json(story);
	})
	.then(null, next);
});

router.delete('/:id', function (req, res, next) {
	if ( req.user === undefined ) return res.status(401).end();
	if ( !( req.user._id === req.story.author._id || req.user.isAdmin ) ) return res.status(401).end();
	req.story.remove()
	.then(function () {
		res.status(204).end();
	})
	.then(null, next);
});

module.exports = router;