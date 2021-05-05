const express = require('express');
const app = express();
const path = require('path');

const mate = require('ejs-mate');
const methodOverride = require('method-override');
const Album = require('./models/album');
const errHandler = require('./handlers/errHandler');
const asyncHandler = require('./handlers/asyncHandler');

const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/musicHub', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const DB = mongoose.connection;
DB.on("error", console.error.bind(console, 'CONNECTION ERROR: '));
DB.once('open', () => { console.log('DATABASE CONNECTED') });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', mate);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/all-albums', asyncHandler(async (req, res, next) => {
    const albums = await Album.find({});
    res.render('albums/index', { albums });
}));

app.post('/all-albums', asyncHandler(async (req, res, next) => {
    const album = new Album(req.body.album);
    await album.save();
    res.redirect(`/album/${album._id}`);
}));

app.get('/album/:id', asyncHandler(async (req, res, next) => {
    const album = await Album.findById(req.params.id);
    if (!album) {
        return next(new errHandler('This album does not exist!', 404));
    }
    res.render('albums/details', { album });
}));

app.put('/album/:id', asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const album = await Album.findById(id);
    if (!album) {
        return next(new errHandler('Cannot update non-existent item', 404));
    };
    await Album.updateOne({_id: id}, { ...req.body.album, new: true });
    res.redirect(`/album/${album._id}`);
}));

app.delete('/album/:id', asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const album = await Album.findById(id);
    if (!album) {
        return next(new errHandler('Cannot delete non-existent item', 404));
    }
    await Album.deleteOne({_id: id});
    res.redirect('/all-albums');
}));

app.get('/new-album', (req, res) => {
    res.render('albums/new');
});

app.get('*', (req, res, next) => {
    next(new errHandler('This page does not exist', 404));
});

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong! :(' } = err;
    res.status(status).render('error', { err });
});


const PORT = 4400;
app.listen(PORT, () => {
    console.log(`LISTENING ON PORT ${PORT}`);
})