const path = require('path');
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;

const SortMiddleware = require('./app/middlewares/SortMiddleware');

const route = require('./routes/index');
const db = require('./config/db');

// Connect to DB
db.connect();

app.use(express.static(path.join(__dirname, 'public')));

app.use(
	express.urlencoded({
		extended: true,
	}),
);
app.use(express.json());

app.use(methodOverride('_method'));

// Custom middlewares
app.use(SortMiddleware);

// HTTP Logger
app.use(morgan('combined'));

// Template engine
app.engine(
	'hbs',
	engine({
		extname: '.hbs',
		helpers: {
			sum: (a, b) => a + b,
			sortable: (field, sort) => {
				const sortType = field === sort.column ? sort.type : 'default';

				const icons = {
					default: 'oi oi-elevator',
					asc: 'oi oi-sort-ascending',
					desc: 'oi oi-sort-descending',
				};
				const types = {
					default: 'desc',
					asc: 'desc',
					desc: 'asc',
				};
				const type = types[sortType];
				const icon = icons[sortType];

				return `<a href="?_sort&column=${field}&type=${type}"><span class="${icon}"></span></a>`;
			},
		},
	}),
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

var hbs = require('handlebars');
hbs.registerHelper("compareStrings", function (p, q, options) {
  return p == q ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper("isOr", function (cond1, cond2, options) {
	return cond1 || cond2 ? options.fn(this) : options.inverse(this);
  });

// Route init
route(app);

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
