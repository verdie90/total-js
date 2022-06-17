COMPONENT('input', 'maxlength:200;dirkey:name;dirvalue:id;increment:1;autovalue:name;direxclude:false;forcevalidation:1;searchalign:1;after:\\:', function(self, config, cls) {

	var cls2 = '.' + cls;
	var input, placeholder, dirsource, binded, customvalidator, mask, rawvalue, isdirvisible = false, nobindcamouflage = false, focused = false;

	self.nocompile();
	self.bindvisible(20);

	self.init = function() {
		Thelpers.ui_input_icon = function(val) {
			return val.charAt(0) === '!' || val.indexOf(' ') !== -1 ? ('<span class="ui-input-icon-custom"><i class="' + (val.charAt(0) === '!' ? val.substring(1) : val) + '"></i></span>') : ('<i class="fa fa-' + val + '"></i>');
		};
		W.ui_input_template = Tangular.compile(('{{ if label }}<div class="{0}-label">{{ if icon }}<i class="{{ icon }}"></i>{{ fi }}{{ label | raw }}{{ after | raw }}</div>{{ fi }}<div class="{0}-control{{ if licon }} {0}-licon{{ fi }}{{ if ricon || (type === \'number\' && increment) }} {0}-ricon{{ fi }}">{{ if ricon || (type === \'number\' && increment) }}<div class="{0}-icon-right{{ if type === \'number\' && increment && !ricon }} {0}-increment{{ else if riconclick || type === \'date\' || type === \'time\' || (type === \'search\' && searchalign === 1) || type === \'password\' }} {0}-click{{ fi }}">{{ if type === \'number\' && !ricon }}<i class="fa fa-caret-up"></i><i class="fa fa-caret-down"></i>{{ else }}{{ ricon | ui_input_icon }}{{ fi }}</div>{{ fi }}{{ if licon }}<div class="{0}-icon-left{{ if liconclick || (type === \'search\' && searchalign !== 1) }} {0}-click{{ fi }}">{{ licon | ui_input_icon }}</div>{{ fi }}<div class="{0}-input{{ if align === 1 || align === \'center\' }} center{{ else if align === 2 || align === \'right\' }} right{{ fi }}">{{ if placeholder && !innerlabel }}<div class="{0}-placeholder">{{ placeholder }}</div>{{ fi }}{{ if dirsource || type === \'icon\' || type === \'emoji\' || type === \'color\' }}<div class="{0}-value" tabindex="0"></div>{{ else }}<input type="{{ if type === \'password\' }}password{{ else }}text{{ fi }}"{{ if autofill }} autocomplete="on" name="{{ PATH }}"{{ else }} name="input' + Date.now() + '" autocomplete="new-password"{{ fi }} data-jc-bind=""{{ if maxlength > 0}} maxlength="{{ maxlength }}"{{ fi }}{{ if autofocus }} autofocus{{ fi }} />{{ fi }}</div></div>{{ if error }}<div class="{0}-error hidden"><i class="fa fa-warning"></i> {{ error }}</div>{{ fi }}').format(cls));
	};

	self.make = function() {

		if (!config.label)
			config.label = self.html();

		if (isMOBILE && config.autofocus)
			config.autofocus = false;

		config.PATH = self.path.replace(/\./g, '_');

		self.aclass(cls + ' invisible');
		self.rclass('invisible', 100);
		self.redraw();

		self.event('input change', function() {
			if (nobindcamouflage)
				nobindcamouflage = false;
			else
				self.check();
		});

		self.event('focus', 'input,' + cls2 + '-value', function() {

			if (config.disabled)
				return $(this).blur();

			focused = true;
			self.camouflage(false);
			self.aclass(cls + '-focused');
			config.autocomplete && EXEC(self.makepath(config.autocomplete), self, input.parent());
			if (config.autosource) {
				var opt = {};
				opt.element = self.element;
				opt.search = GET(self.makepath(config.autosource));
				opt.callback = function(value) {
					var val = typeof(value) === 'string' ? value : value[config.autovalue];
					if (config.autoexec) {
						EXEC(self.makepath(config.autoexec), value, function(val) {
							self.set(val, 2);
							self.change();
							self.bindvalue();
						});
					} else {
						self.set(val, 2);
						self.change();
						self.bindvalue();
					}
				};
				SETTER('autocomplete', 'show', opt);
			} else if (config.mask) {
				setTimeout(function(input) {
					input.selectionStart = input.selectionEnd = 0;
				}, 50, this);
			} else if (config.dirsource && (config.autofocus != false && config.autofocus != 0)) {
				if (!isdirvisible)
					self.find(cls2 + '-control').trigger('click');
			}
		});

		self.event('paste', 'input', function(e) {
			if (config.mask) {
				var val = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
				self.set(val.replace(/\s|\t/g, ''));
				e.preventDefault();
			}
		});

		self.event('keydown', 'input', function(e) {

			var t = this;
			var code = e.which;

			if (t.readOnly || config.disabled) {
				// TAB
				if (e.keyCode !== 9) {
					if (config.dirsource) {
						self.find(cls2 + '-control').trigger('click');
						return;
					}
					e.preventDefault();
					e.stopPropagation();
				}
				return;
			}

			if (!config.disabled && config.dirsource && (code === 13 || code > 30)) {
				self.find(cls2 + '-control').trigger('click');
				return;
			}

			if (config.mask) {

				if (e.metaKey) {
					if (code === 8 || code === 127) {
						e.preventDefault();
						e.stopPropagation();
					}
					return;
				}

				if (code === 32) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}

				var beg = e.target.selectionStart;
				var end = e.target.selectionEnd;
				var val = t.value;
				var c;

				if (code === 8 || code === 127) {

					if (beg === end) {
						c = config.mask.substring(beg - 1, beg);
						t.value = val.substring(0, beg - 1) + c + val.substring(beg);
						self.curpos(beg - 1);
					} else {
						for (var i = beg; i <= end; i++) {
							c = config.mask.substring(i - 1, i);
							val = val.substring(0, i - 1) + c + val.substring(i);
						}
						t.value = val;
						self.curpos(beg);
					}

					e.preventDefault();
					return;
				}

				if (code > 40) {

					var cur = String.fromCharCode(code);

					if (mask && mask[beg]) {
						if (!mask[beg].test(cur)) {
							e.preventDefault();
							return;
						}
					}

					c = config.mask.charCodeAt(beg);
					if (c !== 95) {
						beg++;
						while (true) {
							c = config.mask.charCodeAt(beg);
							if (c === 95 || isNaN(c))
								break;
							else
								beg++;
						}
					}

					if (c === 95) {

						val = val.substring(0, beg) + cur + val.substring(beg + 1);
						t.value = val;
						beg++;

						while (beg < config.mask.length) {
							c = config.mask.charCodeAt(beg);
							if (c === 95)
								break;
							else
								beg++;
						}

						self.curpos(beg);
					} else
						self.curpos(beg + 1);

					e.preventDefault();
					e.stopPropagation();
				}
			}

		});

		self.event('blur', 'input', function() {
			focused = false;
			self.camouflage(true);
			self.rclass(cls + '-focused');
		});

		self.event('click', cls2 + '-control', function() {

			if (config.disabled || isdirvisible)
				return;

			if (config.type === 'icon') {
				opt = {};
				opt.element = self.element;
				opt.value = self.get();
				opt.empty = true;
				opt.callback = function(val) {
					self.change(true);
					self.set(val);
					self.check();
					rawvalue.focus();
				};
				SETTER('faicons', 'show', opt);
				return;
			} else if (config.type === 'color') {
				opt = {};
				opt.element = self.element;
				opt.value = self.get();
				opt.empty = true;
				opt.callback = function(al) {
					self.change(true);
					self.set(al);
					self.check();
					rawvalue.focus();
				};
				SETTER('colorpicker', 'show', opt);
				return;
			} else if (config.type === 'emoji') {
				opt = {};
				opt.element = self.element;
				opt.value = self.get();
				opt.empty = true;
				opt.callback = function(al) {
					self.change(true);
					self.set(al);
					self.check();
					rawvalue.focus();
				};
				SETTER('emoji', 'show', opt);
				return;
			}

			if (!config.dirsource)
				return;

			isdirvisible = true;
			setTimeout(function() {
				isdirvisible = false;
			}, 500);

			var opt = {};
			opt.element = self.find(cls2 + '-control');
			opt.items = dirsource || GET(self.makepath(config.dirsource));
			opt.offsetY = -1 + (config.diroffsety || 0);
			opt.offsetX = 0 + (config.diroffsetx || 0);
			opt.placeholder = config.dirplaceholder;
			opt.render = config.dirrender ? GET(self.makepath(config.dirrender)) : null;
			opt.custom = !!config.dircustom;
			opt.offsetWidth = 2;
			opt.minwidth = config.dirminwidth || 200;
			opt.maxwidth = config.dirmaxwidth;
			opt.key = config.dirkey || config.key;
			opt.empty = config.dirempty;

			if (config.dirraw)
				opt.raw = true;

			if (config.dirsearch != null)
				opt.search = config.dirsearch;

			var val = self.get();
			opt.selected = val;

			if (dirsource && config.direxclude == false) {
				for (var i = 0; i < dirsource.length; i++) {
					var item = dirsource[i];
					if (item)
						item.selected = typeof(item) === 'object' && item[config.dirvalue] === val;
				}
			} else if (config.direxclude) {
				opt.exclude = function(item) {
					return item ? item[config.dirvalue] === val : false;
				};
			}

			opt.callback = function(item, el, custom) {

				// empty
				if (item == null) {
					rawvalue.html('');
					self.set(null, 2);
					self.change();
					self.check();
					return;
				}

				var val = custom || typeof(item) === 'string' ? item : item[config.dirvalue || config.value];
				if (custom && typeof(config.dircustom) === 'string') {
					var fn = GET(config.dircustom);
					fn(val, function(val) {
						self.set(val, 2);
						self.change();
						self.bindvalue();
					});
				} else if (custom) {
					if (val) {
						self.set(val, 2);
						self.change();
						if (dirsource)
							self.bindvalue();
						else
							input.val(val);
					}
				} else {
					self.set(val, 2);
					self.change();
					if (dirsource)
						self.bindvalue();
					else
						input.val(val);
				}

				rawvalue.focus();
			};

			SETTER('directory', 'show', opt);
		});

		self.event('click', cls2 + '-placeholder,' + cls2 + '-label', function(e) {
			if (!config.disabled) {
				if (config.dirsource) {
					e.preventDefault();
					e.stopPropagation();
					self.find(cls2 + '-control').trigger('click');
				} else if (!config.camouflage || $(e.target).hclass(cls + '-placeholder')) {
					if (input.length)
						input.focus();
					else
						rawvalue.focus();
				}
			}
		});

		self.event('click', cls2 + '-icon-left,' + cls2 + '-icon-right', function(e) {

			if (config.disabled)
				return;

			var el = $(this);
			var left = el.hclass(cls + '-icon-left');
			var opt;

			if (config.dirsource && left && config.liconclick) {
				e.preventDefault();
				e.stopPropagation();
			}

			if (!left && !config.riconclick) {
				if (config.type === 'date') {
					opt = {};
					opt.element = self.element;
					opt.value = self.get();
					opt.callback = function(val) {
						self.change(true);
						self.set(val);
						input.focus();
					};
					SETTER('datepicker', 'show', opt);
				} else if (config.type === 'time') {
					opt = {};
					opt.element = self.element;
					opt.value = self.get();
					opt.callback = function(val) {
						self.change(true);
						self.set(val);
						input.focus();
					};
					SETTER('timepicker', 'show', opt);
				} else if (config.type === 'search')
					self.set('');
				else if (config.type === 'password')
					self.password();
				else if (config.type === 'number') {
					var tmp = $(e.target);
					if (tmp.attr('class').indexOf('fa-') !== -1) {
						var n = tmp.hclass('fa-caret-up') ? 1 : -1;
						self.change(true);
						var val = self.preparevalue((self.get() || 0) + (config.increment * n));
						self.set(val, 2);
					}
				}
				return;
			}

			if (left && config.liconclick)
				EXEC(self.makepath(config.liconclick), self, el);
			else if (config.riconclick)
				EXEC(self.makepath(config.riconclick), self, el);
			else if (left && config.type === 'search')
				self.set('');

		});
	};

	self.camouflage = function(is) {
		if (config.camouflage) {
			if (is) {
				var t = input[0];
				var arr = t.value.split('');
				for (var i = 0; i < arr.length; i++)
					arr[i] = typeof(config.camouflage) === 'string' ? config.camouflage : '*';
				nobindcamouflage = true;
				t.value = arr.join('');
			} else {
				nobindcamouflage = true;
				var val = self.get();
				input[0].value = val == null ? '' : val;
			}
			self.tclass(cls + '-camouflaged', is);
		}
	};

	self.curpos = function(pos) {
		var el = input[0];
		if (el.createTextRange) {
			var range = el.createTextRange();
			range.move('character', pos);
			range.select();
		} else if (el.selectionStart) {
			el.focus();
			el.setSelectionRange(pos, pos);
		}
	};

	self.validate = function(value) {

		if ((!config.required || config.disabled) && !self.forcedvalidation())
			return true;

		if (config.dirsource)
			return !!value;

		if (customvalidator)
			return customvalidator(value);

		if (self.type === 'date')
			return value instanceof Date && !isNaN(value.getTime());

		if (value == null)
			value = '';
		else
			value = value.toString();

		if (config.mask && typeof(value) === 'string' && value.indexOf('_') !== -1)
			return false;

		if (config.minlength && value.length < config.minlength)
			return false;

		switch (self.type) {
			case 'email':
				return value.isEmail();
			case 'phone':
				return value.isPhone();
			case 'url':
				return value.isURL();
			case 'zip':
				return (/^\d{5}(?:[-\s]\d{4})?$/).test(value);
			case 'currency':
			case 'number':
				value = value.parseFloat();
				if ((config.minvalue != null && value < config.minvalue) || (config.maxvalue != null && value > config.maxvalue))
					return false;
				return config.minvalue == null ? value > 0 : true;
		}

		return value.length > 0;
	};

	self.offset = function() {
		var offset = self.element.offset();
		var control = self.find(cls2 + '-control');
		var width = control.width() + 2;
		return { left: offset.left, top: control.offset().top + control.height(), width: width };
	};

	self.password = function(show) {
		var visible = show == null ? input.attr('type') === 'text' : show;
		input.attr('type', visible ? 'password' : 'text');
		self.find(cls2 + '-icon-right').find('i').tclass(config.ricon, visible).tclass('fa-eye-slash', !visible);
	};

	self.preparevalue = function(value) {

		if (self.type === 'number' && (config.minvalue != null || config.maxvalue != null)) {
			var tmp = typeof(value) === 'string' ? +value.replace(',', '.') : value;
			if (config.minvalue > tmp)
				value = config.minvalue;
			if (config.maxvalue < tmp)
				value = config.maxvalue;
		}

		return value;
	};

	self.getterin = self.getter;
	self.getter = function(value, realtime, nobind) {

		if (nobindcamouflage)
			return;

		if (config.mask && config.masktidy) {
			var val = [];
			for (var i = 0; i < value.length; i++) {
				if (config.mask.charAt(i) === '_')
					val.push(value.charAt(i));
			}
			value = val.join('');
		}

		self.getterin(self.preparevalue(value), realtime, nobind);
	};

	self.setterin = self.setter;

	self.setter = function(value, path, type) {

		if (config.mask) {
			if (value) {
				if (config.masktidy) {
					var index = 0;
					var val = [];
					for (var i = 0; i < config.mask.length; i++) {
						var c = config.mask.charAt(i);
						val.push(c === '_' ? (value.charAt(index++) || '_') : c);
					}
					value = val.join('');
				}

				// check values
				if (mask) {
					var arr = [];
					for (var i = 0; i < mask.length; i++) {
						var c = value.charAt(i);
						if (mask[i] && mask[i].test(c))
							arr.push(c);
						else
							arr.push(config.mask.charAt(i));
					}
					value = arr.join('');
				}
			} else
				value = config.mask;
		}

		self.setterin(value, path, type);
		self.bindvalue();

		config.camouflage && !focused && setTimeout(self.camouflage, type === 1 ? 1000 : 1, true);

		if (config.type === 'password')
			self.password(true);
	};

	self.check = function() {

		var is = input.length ? !!input[0].value : !!self.get();

		if (binded === is)
			return;

		binded = is;
		placeholder && placeholder.tclass('hidden', is);
		self.tclass(cls + '-binded', is);

		if (config.type === 'search')
			self.find(cls2 + '-icon-' + (config.searchalign === 1 ? 'right' : 'left')).find('i').tclass(config.searchalign === 1 ? config.ricon : config.licon, !is).tclass('fa-times', is);
	};

	self.bindvalue = function() {

		var value = self.get();

		if (dirsource) {

			var item;

			for (var i = 0; i < dirsource.length; i++) {
				item = dirsource[i];
				if (typeof(item) === 'string') {
					if (item === value)
						break;
					item = null;
				} else if (item[config.dirvalue || config.value] === value) {
					item = item[config.dirkey || config.key];
					break;
				} else
					item = null;
			}

			if (value && item == null && config.dircustom)
				item = value;

			if (config.dirraw)
				rawvalue.html(item || '');
			else
				rawvalue.text(item || '');

		} else if (config.dirsource)
			if (config.dirraw)
				rawvalue.html(value || '');
			else
				rawvalue.text(value || '');
		else {
			switch (config.type) {
				case 'color':
					rawvalue.css('background-color', value || '');
					break;
				case 'icon':
					rawvalue.html('<i class="{0}"></i>'.format(value || ''));
					break;
				case 'emoji':
					rawvalue.html(value);
					break;
			}
		}

		self.check();
	};

	self.redraw = function() {

		if (!config.ricon) {
			if (config.dirsource)
				config.ricon = 'angle-down';
			else if (config.type === 'date') {
				config.ricon = 'calendar';
				if (!config.align && !config.innerlabel)
					config.align = 1;
			} else if (config.type === 'icon' || config.type === 'color' || config.type === 'emoji') {
				config.ricon = 'angle-down';
				if (!config.align && !config.innerlabel)
					config.align = 1;
			} else if (config.type === 'time') {
				config.ricon = 'clock-o';
				if (!config.align && !config.innerlabel)
					config.align = 1;
			} else if (config.type === 'search')
				if (config.searchalign === 1)
					config.ricon = 'search';
				else
					config.licon = 'search';
			else if (config.type === 'password')
				config.ricon = 'eye';
			else if (config.type === 'number') {
				if (!config.align && !config.innerlabel)
					config.align = 1;
			}
		}

		self.tclass(cls + '-masked', !!config.mask);
		self.rclass2(cls + '-type-');

		if (config.type)
			self.aclass(cls + '-type-' + config.type);

		self.html(W.ui_input_template(config));
		input = self.find('input');
		rawvalue = self.find(cls2 + '-value');
		placeholder = self.find(cls2 + '-placeholder');
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'icon':
				if (value && value.indexOf(' ') === -1)
					config.icon = 'fa fa-' + value;
				break;
			case 'dirsource':
				if (config.dirajax || value.indexOf('/') !== -1) {
					dirsource = null;
					self.bindvalue();
				} else {
					if (value.indexOf(',') !== -1) {
						dirsource = self.parsesource(value);
						self.bindvalue();
					} else {
						self.datasource(value, function(path, value) {
							dirsource = value;
							self.bindvalue();
						});
					}
				}
				self.tclass(cls + '-dropdown', !!value);
				input.prop('readonly', !!config.disabled || !!config.dirsource);
				break;
			case 'disabled':
				self.tclass('ui-disabled', !!value);
				input.prop('readonly', !!value || !!config.dirsource);
				self.reset();
				break;
			case 'required':
				self.tclass(cls + '-required', !!value);
				self.reset();
				break;
			case 'type':
				self.type = value;
				break;
			case 'validate':
				customvalidator = value ? (/\(|=|>|<|\+|-|\)/).test(value) ? FN('value=>' + value) : (function(path) { return function(value) { return GET(path)(value); }; })(value) : null;
				break;
			case 'innerlabel':
				self.tclass(cls + '-inner', !!value);
				break;
			case 'monospace':
				self.tclass(cls + '-monospace', !!value);
				break;
			case 'maskregexp':
				if (value) {
					mask = value.toLowerCase().split(',');
					for (var i = 0; i < mask.length; i++) {
						var m = mask[i];
						if (!m || m === 'null')
							mask[i] = '';
						else
							mask[i] = new RegExp(m);
					}
				} else
					mask = null;
				break;
			case 'mask':
				config.mask = value.replace(/#/g, '_');
				break;
		}
	};

	self.formatter(function(path, value) {
		if (value) {
			switch (config.type) {
				case 'lower':
					return (value + '').toLowerCase();
				case 'upper':
					return (value + '').toUpperCase();
				case 'phone':
					return (value + '').replace(/\s/g, '');
				case 'email':
					return (value + '').toLowerCase();
				case 'date':
					return value.format(config.format || 'yyyy-MM-dd');
				case 'time':
					return value.format(config.format || 'HH:mm');
				case 'number':
					return config.format ? value.format(config.format) : value;
			}
		}

		return value;
	});

	self.parser(function(path, value) {
		if (value) {
			var tmp;
			switch (config.type) {
				case 'date':
					tmp = self.get();
					if (tmp)
						tmp = tmp.format('HH:mm');
					else
						tmp = '';
					return value + (tmp ? (' ' + tmp) : '');
				case 'lower':
				case 'email':
					value = value.toLowerCase();
					break;
				case 'upper':
					value = value.toUpperCase();
					break;
				case 'phone':
					value = value.replace(/\s/g, '');
					break;
				case 'time':
					tmp = value.split(':');
					var dt = self.get();
					if (dt == null)
						dt = new Date();
					dt.setHours(+(tmp[0] || '0'));
					dt.setMinutes(+(tmp[1] || '0'));
					dt.setSeconds(+(tmp[2] || '0'));
					value = dt;
					break;
			}
		}
		return value ? config.spaces === false ? value.replace(/\s/g, '') : value : value;
	});

	self.state = function(type) {
		if (type) {
			var invalid = config.required ? self.isInvalid() : self.forcedvalidation() ? self.isInvalid() : false;
			if (invalid === self.$oldstate)
				return;
			self.$oldstate = invalid;
			self.tclass(cls + '-invalid', invalid);
			config.error && self.find(cls2 + '-error').tclass('hidden', !invalid);
		}
	};

	self.forcedvalidation = function() {

		if (!config.forcevalidation)
			return false;

		if (self.type === 'number')
			return false;

		var val = self.get();
		return (self.type === 'phone' || self.type === 'email') && (val != null && (typeof(val) === 'string' && val.length !== 0));
	};

});

COMPONENT('directory', 'minwidth:200', function(self, config, cls) {

	var cls2 = '.' + cls;
	var container, timeout, icon, plus, skipreset = false, skipclear = false, ready = false, input = null, issearch = false;
	var is = false, selectedindex = 0, resultscount = 0;
	var templateE = '{{ name | encode | ui_directory_helper }}';
	var templateR = '{{ name | raw }}';
	var template = '<li data-index="{{ $.index }}" data-search="{{ $.search }}" {{ if selected }} class="current selected{{ if classname }} {{ classname }}{{ fi }}"{{ else if classname }} class="{{ classname }}"{{ fi }}>{0}</li>';
	var templateraw = template.format(templateR);
	var regstrip = /(&nbsp;|<([^>]+)>)/ig;
	var parentclass;

	template = template.format(templateE);

	Thelpers.ui_directory_helper = function(val) {
		var t = this;
		return t.template ? (typeof(t.template) === 'string' ? t.template.indexOf('{{') === -1 ? t.template : Tangular.render(t.template, this) : t.render(this, val)) : self.opt.render ? self.opt.render(this, val) : val;
	};

	self.template = Tangular.compile(template);
	self.templateraw = Tangular.compile(templateraw);

	self.readonly();
	self.singleton();
	self.nocompile && self.nocompile();

	self.configure = function(key, value, init) {
		if (init)
			return;
		switch (key) {
			case 'placeholder':
				self.find('input').prop('placeholder', value);
				break;
		}
	};

	self.make = function() {

		self.aclass(cls + ' hidden');
		self.append('<div class="{1}-search"><span class="{1}-add hidden"><i class="fa fa-plus"></i></span><span class="{1}-button"><i class="fa fa-search"></i></span><div><input type="text" placeholder="{0}" class="{1}-search-input" name="dir{2}" autocomplete="new-password" /></div></div><div class="{1}-container"><ul></ul></div>'.format(config.placeholder, cls, Date.now()));
		container = self.find('ul');
		input = self.find('input');
		icon = self.find(cls2 + '-button').find('.fa');
		plus = self.find(cls2 + '-add');

		self.event('mouseenter mouseleave', 'li', function() {
			if (ready && !issearch) {
				container.find('li.current').rclass('current');
				$(this).aclass('current');
				var arr = container.find('li:visible');
				for (var i = 0; i < arr.length; i++) {
					if ($(arr[i]).hclass('current')) {
						selectedindex = i;
						break;
					}
				}
			}
		});

		self.event('focus', 'input', function() {
			if (self.opt.search === false)
				$(this).blur();
		});

		self.event('click', cls2 + '-button', function(e) {
			skipclear = false;
			input.val('');
			self.search();
			e.stopPropagation();
			e.preventDefault();
		});

		self.event('click', cls2 + '-add', function() {
			if (self.opt.custom && self.opt.callback) {
				self.opt.scope && M.scope(self.opt.scope);
				self.opt.callback(input.val(), self.opt.element, true);
				self.hide();
			}
		});

		self.event('click', 'li', function(e) {
			if (self.opt.callback) {
				self.opt.scope && M.scope(self.opt.scope);
				self.opt.callback(self.opt.items[+this.getAttribute('data-index')], self.opt.element);
			}
			is = true;
			self.hide(0);
			e.preventDefault();
			e.stopPropagation();
		});

		var e_click = function(e) {
			var node = e.target;
			var count = 0;

			if (is) {
				while (true) {
					var c = node.getAttribute('class') || '';
					if (c.indexOf(cls + '-search-input') !== -1)
						return;
					node = node.parentNode;
					if (!node || !node.tagName || node.tagName === 'BODY' || count > 3)
						break;
					count++;
				}
			} else {
				is = true;
				while (true) {
					var c = node.getAttribute('class') || '';
					if (c.indexOf(cls) !== -1) {
						is = false;
						break;
					}
					node = node.parentNode;
					if (!node || !node.tagName || node.tagName === 'BODY' || count > 4)
						break;
					count++;
				}
			}

			is && self.hide(0);
		};

		var e_resize = function() {
			is && self.hide(0);
		};

		self.bindedevents = false;

		self.bindevents = function() {
			if (!self.bindedevents) {
				$(document).on('click', e_click);
				$(W).on('resize', e_resize);
				self.bindedevents = true;
			}
		};

		self.unbindevents = function() {
			if (self.bindedevents) {
				self.bindedevents = false;
				$(document).off('click', e_click);
				$(W).off('resize', e_resize);
			}
		};

		self.event('keydown', 'input', function(e) {
			var o = false;
			switch (e.which) {
				case 8:
					skipclear = false;
					break;
				case 27:
					o = true;
					self.hide();
					break;
				case 13:
					o = true;
					var sel = self.find('li.current');
					if (self.opt.callback) {
						self.opt.scope && M.scope(self.opt.scope);
						if (sel.length)
							self.opt.callback(self.opt.items[+sel.attrd('index')], self.opt.element);
						else if (self.opt.custom)
							self.opt.callback(this.value, self.opt.element, true);
					}
					self.hide();
					break;
				case 38: // up
					o = true;
					selectedindex--;
					if (selectedindex < 0)
						selectedindex = 0;
					self.move();
					break;
				case 40: // down
					o = true;
					selectedindex++;
					if (selectedindex >= resultscount)
						selectedindex = resultscount;
					self.move();
					break;
			}

			if (o) {
				e.preventDefault();
				e.stopPropagation();
			}

		});

		self.event('input', 'input', function() {
			issearch = true;
			setTimeout2(self.ID, self.search, 100, null, this.value);
		});

		var fn = function() {
			is && self.hide(1);
		};

		self.on('reflow', fn);
		self.on('scroll', fn);
		self.on('resize', fn);
		$(W).on('scroll', fn);
	};

	self.move = function() {

		var counter = 0;
		var scroller = container.parent();
		var li = container.find('li');
		var hli = (li.eq(0).innerHeight() || 30) + 1;
		var was = false;
		var last = -1;
		var lastselected = 0;
		var plus = (hli * 2);

		for (var i = 0; i < li.length; i++) {

			var el = $(li[i]);

			if (el.hclass('hidden')) {
				el.rclass('current');
				continue;
			}

			var is = selectedindex === counter;
			el.tclass('current', is);

			if (is) {
				was = true;
				var t = (hli * (counter || 1));
				// var p = (t / sh) * 100;
				scroller[0].scrollTop = t - plus;
			}

			counter++;
			last = i;
			lastselected++;
		}

		if (!was && last >= 0) {
			selectedindex = lastselected;
			li.eq(last).aclass('current');
		}
	};

	var nosearch = function() {
		issearch = false;
	};

	self.nosearch = function() {
		setTimeout2(self.ID + 'nosearch', nosearch, 500);
	};

	self.search = function(value) {

		if (!self.opt)
			return;

		icon.tclass('fa-times', !!value).tclass('fa-search', !value);
		self.opt.custom && plus.tclass('hidden', !value);

		if (!value && !self.opt.ajax) {
			if (!skipclear)
				container.find('li').rclass('hidden');
			if (!skipreset)
				selectedindex = 0;
			resultscount = self.opt.items ? self.opt.items.length : 0;
			self.move();
			self.nosearch();
			return;
		}

		resultscount = 0;
		selectedindex = 0;

		if (self.opt.ajax) {
			var val = value || '';
			if (self.ajaxold !== val) {
				self.ajaxold = val;
				setTimeout2(self.ID, function(val) {
					self.opt && self.opt.ajax(val, function(items) {
						var builder = [];
						var indexer = {};
						var item;
						var key = (self.opt.search == true ? self.opt.key : (self.opt.search || self.opt.key)) || 'name';

						for (var i = 0; i < items.length; i++) {
							item = items[i];
							if (self.opt.exclude && self.opt.exclude(item))
								continue;
							indexer.index = i;
							indexer.search = item[key] ? item[key].replace(regstrip, '') : '';
							resultscount++;
							builder.push(self.opt.ta(item, indexer));
						}

						if (self.opt.empty) {
							item = {};
							var tmp = self.opt.raw ? '<b>{0}</b>'.format(self.opt.empty) : self.opt.empty;
							item[self.opt.key || 'name'] = tmp;
							if (!self.opt.raw)
								item.template = '<b>{0}</b>'.format(self.opt.empty);
							indexer.index = -1;
							builder.unshift(self.opt.ta(item, indexer));
						}

						skipclear = true;
						self.opt.items = items;
						container.html(builder);
						self.move();
						self.nosearch();
					});
				}, 300, null, val);
			}
		} else if (value) {
			value = value.toSearch();
			var arr = container.find('li');
			for (var i = 0; i < arr.length; i++) {
				var el = $(arr[i]);
				var val = el.attrd('search').toSearch();
				var is = val.indexOf(value) === -1;
				el.tclass('hidden', is);
				if (!is)
					resultscount++;
			}
			skipclear = true;
			self.move();
			self.nosearch();
		}
	};

	self.show = function(opt) {

		// opt.element
		// opt.items
		// opt.callback(value, el)
		// opt.offsetX     --> offsetX
		// opt.offsetY     --> offsetY
		// opt.offsetWidth --> plusWidth
		// opt.placeholder
		// opt.render
		// opt.custom
		// opt.minwidth
		// opt.maxwidth
		// opt.key
		// opt.exclude    --> function(item) must return Boolean
		// opt.search
		// opt.selected   --> only for String Array "opt.items"
		// opt.classname

		var el = opt.element instanceof jQuery ? opt.element[0] : opt.element;

		if (opt.items == null)
			opt.items = EMPTYARRAY;

		self.tclass(cls + '-default', !opt.render);

		if (parentclass) {
			self.rclass(parentclass);
			parentclass = null;
		}

		if (opt.classname) {
			self.aclass(opt.classname);
			parentclass = opt.classname;
		}

		if (!opt.minwidth)
			opt.minwidth = 200;

		if (is) {
			clearTimeout(timeout);
			if (self.target === el) {
				self.hide(1);
				return;
			}
		}

		self.initializing = true;
		self.target = el;
		opt.ajax = null;
		self.ajaxold = null;

		var element = $(opt.element);
		var callback = opt.callback;
		var items = opt.items;
		var type = typeof(items);
		var item;

		if (type === 'string') {
			items = GET(items);
			type = typeof(items);
		}

		if (type === 'function' && callback) {
			type = '';
			opt.ajax = items;
			items = null;
		}

		if (!items && !opt.ajax) {
			self.hide(0);
			return;
		}

		setTimeout(self.bindevents, 500);
		self.tclass(cls + '-search-hidden', opt.search === false);

		self.opt = opt;
		opt.class && self.aclass(opt.class);

		input.val('');

		var builder = [];
		var selected = null;

		opt.ta = opt.key ? Tangular.compile((opt.raw ? templateraw : template).replace(/\{\{\sname/g, '{{ ' + opt.key)) : opt.raw ? self.templateraw : self.template;

		if (!opt.ajax) {
			var indexer = {};
			var key = (opt.search == true ? opt.key : (opt.search || opt.key)) || 'name';
			for (var i = 0; i < items.length; i++) {

				item = items[i];

				if (typeof(item) === 'string')
					item = { name: item, id: item, selected: item === opt.selected };

				if (opt.exclude && opt.exclude(item))
					continue;

				if (item.selected || opt.selected === item) {
					selected = i;
					skipreset = true;
					item.selected = true;
				} else
					item.selected = false;

				indexer.index = i;
				indexer.search = item[key] ? item[key].replace(regstrip, '') : '';
				builder.push(opt.ta(item, indexer));
			}

			if (opt.empty) {
				item = {};
				var tmp = opt.raw ? '<b>{0}</b>'.format(opt.empty) : opt.empty;
				item[opt.key || 'name'] = tmp;
				if (!opt.raw)
					item.template = '<b>{0}</b>'.format(opt.empty);
				indexer.index = -1;
				builder.unshift(opt.ta(item, indexer));
			}
		}

		self.target = element[0];

		var w = element.width();
		var offset = element.offset();
		var width = w + (opt.offsetWidth || 0);

		if (opt.minwidth && width < opt.minwidth)
			width = opt.minwidth;
		else if (opt.maxwidth && width > opt.maxwidth)
			width = opt.maxwidth;

		ready = false;

		opt.ajaxold = null;
		plus.aclass('hidden');
		self.find('input').prop('placeholder', opt.placeholder || config.placeholder);
		var scroller = self.find(cls2 + '-container').css('width', width + 30);
		container.html(builder);

		var options = { left: 0, top: 0, width: width };

		switch (opt.align) {
			case 'center':
				options.left = Math.ceil((offset.left - width / 2) + (width / 2));
				break;
			case 'right':
				options.left = (offset.left - width) + w;
				break;
			default:
				options.left = offset.left;
				break;
		}

		options.top = opt.position === 'bottom' ? ((offset.top - self.height()) + element.height()) : offset.top;
		options.scope = M.scope ? M.scope() : '';

		if (opt.offsetX)
			options.left += opt.offsetX;

		if (opt.offsetY)
			options.top += opt.offsetY;

		self.css(options);

		!isMOBILE && setTimeout(function() {
			ready = true;
			if (opt.search !== false)
				input.focus();
		}, 200);

		setTimeout(function() {
			self.initializing = false;
			is = true;
			if (selected == null)
				scroller[0].scrollTop = 0;
			else {
				var h = container.find('li:first-child').innerHeight() + 1;
				var y = (container.find('li.selected').index() * h) - (h * 2);
				scroller[0].scrollTop = y < 0 ? 0 : y;
			}
		}, 100);

		if (is) {
			self.search();
			return;
		}

		selectedindex = selected || 0;
		resultscount = items ? items.length : 0;
		skipclear = true;

		self.search();
		self.rclass('hidden');

		setTimeout(function() {
			if (self.opt && self.target && self.target.offsetParent)
				self.aclass(cls + '-visible');
			else
				self.hide(1);
		}, 100);

		skipreset = false;
	};

	self.hide = function(sleep) {
		if (!is || self.initializing)
			return;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			self.unbindevents();
			self.rclass(cls + '-visible').aclass('hidden');
			if (self.opt) {
				self.opt.close && self.opt.close();
				self.opt.class && self.rclass(self.opt.class);
				self.opt = null;
			}
			is = false;
		}, sleep ? sleep : 100);
	};
});

COMPONENT('radiobuttonexpert', function(self, config, cls) {

	var cls2 = '.' + cls;
	var template;
	var recompile = false;
	var selected;
	var reg = /\$(index|path)/g;

	self.nocompile();

	self.configure = function(key, value, init) {
		if (init)
			return;
		switch (key) {
			case 'disabled':
				self.tclass('ui-disabled', value);
				break;
			case 'required':
				self.find(cls2 + '-label').tclass(cls + '-label-required', value);
				break;
			case 'type':
				self.type = config.type;
				break;
			case 'label':
				self.find(cls2 + '-label').html(value);
				break;
			case 'datasource':
				if (value.indexOf(',') === -1)
					self.datasource(value, self.bind);
				else
					self.bind('', self.parsesource(value));
				break;
		}
	};

	self.make = function() {

		var element = self.find('script');
		if (!element.length)
			return;

		var html = element.html();
		element.remove();
		html = html.replace('>', ' data-value="{{ {0} }}" data-disabled="{{ {1} }}">'.format(config.value || 'id', config.disabledkey || 'disabled'));
		template = Tangular.compile(html);
		recompile = html.COMPILABLE();

		config.label && self.html('<div class="' + cls + '-label{1}">{0}</div>'.format(config.label, config.required ? (' ' + cls + '-label-required') : ''));
		config.datasource && self.reconfigure('datasource:' + config.datasource);
		config.type && (self.type = config.type);
		config.disabled && self.aclass('ui-disabled');

		self.event('click', '[data-value]', function() {
			var el = $(this);
			if (config.disabled || +el.attrd('disabled'))
				return;
			var value = self.parser(el.attrd('value'));
			self.set(value);
			self.change(true);
		});
	};

	self.validate = function(value) {
		return config.disabled || !config.required ? true : !!value;
	};

	self.setter = function(value) {

		selected && selected.rclass('selected');

		if (value == null)
			return;

		var el = self.find('[data-value="' + value + '"]');
		if (el) {
			el.aclass('selected');
			selected = el;
		}
	};

	self.bind = function(path, arr) {

		if (!arr)
			arr = EMPTYARRAY;

		var builder = [];
		var disabledkey = config.disabledkey || 'disabled';

		for (var i = 0; i < arr.length; i++) {
			var item = arr[i];
			item[disabledkey] = +item[disabledkey] || 0;
			builder.push(template(item).replace(reg, function(text) {
				return text.substring(0, 2) === '$i' ? i.toString() : self.path + '[' + i + ']';
			}));
		}

		var render = builder.join('');
		self.find(cls2 + '-container').remove();
		self.append('<div class="{0}-container{1}">{2}</div>'.format(cls, config.class ? ' ' + config.class : '', render));
		self.refresh();
		recompile && self.compile();
	};

});

COMPONENT('part', 'hide:1;loading:1', function(self, config) {

	var init = false;
	var clid = null;
	var downloading = false;
	var cls = 'ui-' + self.name;
	var isresizing = false;

	self.releasemode && self.releasemode('true');
	self.readonly();

	self.make = function() {
		self.aclass(cls);
	};

	self.resize = function() {
		if (config.absolute) {
			var pos = self.element.position();
			var obj = {};
			obj.width = WW - pos.left;
			obj.height = WH - pos.top;
			self.css(obj);
		}
	};

	self.destroy = function() {
		isresizing && $(W).off('resize', self.resize);
	};

	self.setter = function(value) {

		if (config.if !== value) {

			if (!self.hclass('hidden')) {
				config.hidden && EXEC(self.makepath(config.hidden));
				config.hide && self.aclass('hidden');
				self.release(true);
			}

			if (config.cleaner && init && !clid)
				clid = setTimeout(self.clean, config.cleaner * 60000);

			return;
		}

		if (config.absolute && !isresizing) {
			$(W).on('resize', self.resize);
			isresizing = true;
		}

		config.hide && self.rclass('hidden');

		if (self.dom.hasChildNodes()) {

			if (clid) {
				clearTimeout(clid);
				clid = null;
			}

			self.release(false);
			config.reload && EXEC(self.makepath(config.reload));
			config.default && DEFAULT(self.makepath(config.default), true);
			isresizing && setTimeout(self.resize, 50);
			setTimeout(self.emitresize, 200);

		} else {

			if (downloading)
				return;

			config.loading && SETTER('loading', 'show');
			downloading = true;
			setTimeout(function() {

				var preparator = config.path == null ? null : function(content) {
					return content.replace(/~PATH~/g, config.path);
				};

				if (preparator == null && config.replace)
					preparator = GET(self.makepath(config.replace));

				self.import(config.url, function() {
					downloading = false;

					if (!init) {
						config.init && EXEC(self.makepath(config.init));
						init = true;
					}

					self.release(false);
					config.reload && EXEC(self.makepath(config.reload), true);
					config.default && DEFAULT(self.makepath(config.default), true);
					config.loading && SETTER('loading', 'hide', 500);
					EMIT('parts.' + config.if, self.element, self);
					self.hclass('invisible') && self.rclass('invisible', 500);
					isresizing && setTimeout(self.resize, 50);
					setTimeout(self.emitresize, 200);

				}, true, preparator);

			}, 200);
		}
	};

	self.emitresize = function() {
		self.element.SETTER('*', 'resize');
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'if':
				config.if = value + '';
				break;
			case 'absolute':
				var is = !!value;
				self.tclass(cls + '-absolute', is);
				break;
		}
	};

	self.clean = function() {
		if (self.hclass('hidden')) {
			config.clean && EXEC(self.makepath(config.clean));
			setTimeout(function() {
				self.empty();
				init = false;
				clid = null;
				setTimeout(FREE, 1000);
			}, 1000);
		}
	};
});

COMPONENT('importer', function(self, config) {

	var init = false;
	var clid = null;
	var pending = false;
	var content = '';

	self.readonly();

	self.make = function() {
		var scr = self.find('script');
		content = scr.length ? scr.html() : '';
	};

	self.reload = function(recompile) {
		config.reload && EXEC(config.reload);
		recompile && COMPILE();
		setTimeout(function() {
			pending = false;
			init = true;
		}, 1000);
	};

	self.setter = function(value) {

		if (pending)
			return;

		if (config.if !== value) {
			if (config.cleaner && init && !clid)
				clid = setTimeout(self.clean, config.cleaner * 60000);
			return;
		}

		pending = true;

		if (clid) {
			clearTimeout(clid);
			clid = null;
		}

		if (init) {
			self.reload();
			return;
		}

		if (content) {
			self.html(content);
			setTimeout(self.reload, 50, true);
		} else
			self.import(config.url, self.reload);
	};

	self.clean = function() {
		config.clean && EXEC(config.clean);
		setTimeout(function() {
			self.empty();
			init = false;
			clid = null;
		}, 1000);
	};
});

COMPONENT('exec', function(self, config) {
	self.readonly();
	self.blind();
	self.make = function() {

		var scope = null;

		var scopepath = function(el, val) {
			if (!scope)
				scope = el.scope();
			return val == null ? scope : scope ? scope.makepath ? scope.makepath(val) : val.replace(/\?/g, el.scope().path) : val;
		};

		var fn = function(plus) {
			return function(e) {

				var el = $(this);
				var attr = el.attrd('exec' + plus);
				var path = el.attrd('path' + plus);
				var href = el.attrd('href' + plus);
				var def = el.attrd('def' + plus);
				var reset = el.attrd('reset' + plus);

				scope = null;

				var prevent = el.attrd('prevent' + plus);

				if (prevent === 'true' || prevent === '1') {
					e.preventDefault();
					e.stopPropagation();
				}

				if (attr) {
					if (attr.indexOf('?') !== -1) {
						var tmp = scopepath(el);
						if (tmp) {
							M.scope(tmp.path);
							attr = tmp.makepath ? tmp.makepath(attr) : attr.replace(/\?/g, tmp.path);
						}
					}
					EXEC(attr, el, e);
				}

				href && NAV.redirect(href);

				if (def) {
					if (def.indexOf('?') !== -1)
						def = scopepath(el, def);
					DEFAULT(def);
				}

				if (reset) {
					if (reset.indexOf('?') !== -1)
						reset = scopepath(el, reset);
					RESET(reset);
				}

				if (path) {
					var val = el.attrd('value');
					if (val) {
						if (path.indexOf('?') !== -1)
							path = scopepath(el, path);
						var v = GET(path);
						SET(path, new Function('value', 'return ' + val)(v), true);
					}
				}
			};
		};

		self.event('dblclick', config.selector2 || '.exec2', fn('2'));
		self.event('click', config.selector || '.exec', fn(''));
	};
});

COMPONENT('selected', 'class:selected;selector:a;attr:if', function(self, config) {

	self.readonly();

	self.configure = function(key, value) {
		switch (key) {
			case 'datasource':
				self.datasource(value, function() {
					setTimeout(self.refresh, 50);
				});
				break;
		}
	};

	self.setter = function(value) {
		var cls = config.class;
		self.find(config.selector).each(function() {
			var el = $(this);
			if (el.attrd(config.attr) === value)
				el.aclass(cls);
			else
				el.hclass(cls) && el.rclass(cls);
		});
	};
});

COMPONENT('layout2', 'scrollbar:1;parent:window;autoresize:1;margin:0', function(self, config, cls) {

	var top;
	var bottom;
	var left;
	var right;
	var main;
	var cachesize;
	var init = false;

	self.init = function() {
		var obj;
		if (W.OP)
			obj = W.OP;
		else
			obj = $(W);
		obj.on('resize', function() {
			for (var i = 0; i < M.components.length; i++) {
				var com = M.components[i];
				if (com.name === 'layout2' && com.dom.offsetParent && com.$ready && !com.$removed && com.config.autoresize)
					com.resize();
			}
		});
	};

	self.parse_number = function(value, total) {
		var tmp = value.parseInt();
		return value.indexOf('%') === -1 ? tmp : ((total / 100) * tmp);
	};

	self.parse_size = function(el) {
		var size = (el.attrd('size') || '').split(',').trim();
		var obj = { lg: size[0] || '0' };
		obj.md = size[1] == null ? obj.lg : size[1];
		obj.sm = size[2] == null ? obj.md : size[2];
		obj.xs = size[3] == null ? obj.sm : size[3];

		var keys = Object.keys(obj);
		var reg = /px|%/;
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var val = obj[key];
			if (!reg.test(val))
				obj[key] += 'px';
		}

		return obj;
	};

	self.parse_item = function(el) {
		var scrollbar = el.attrd('scrollbar');
		var type = el.attrd('type');
		var item = {};
		item.el = el;
		item.size = type ? self.parse_size(el) : null;
		item.type = type || 'main';
		item.css = {};
		item.scrollbar = scrollbar ? scrollbar.parseConfig() : null;

		if (item.scrollbar) {

			var screl;

			if (item.scrollbar.selector) {
				screl = el.find(item.scrollbar.selector);
			} else {
				var dom = el[0];
				var div = document.createElement('DIV');
				while (dom.children.length)
					div.appendChild(dom.children[0]);
				dom.appendChild(div);
				$(div).aclass(cls + '-scrollbar');
				screl = $(div);
			}

			var opt = { visibleY: item.scrollbar.visible || item.scrollbar.visibleY, orientation: 'y' };
			item.scrollbarcontainer = screl;
			item.scrollbar.instance = SCROLLBAR(screl, opt);
			item.scrollbar.resize = function(h) {
				var t = this;
				item.scrollbarcontainer.css('height', h - (t.margin || 0));
				item.scrollbar.instance.resize();
			};
		}

		el.aclass(cls + '-section ' + cls + '-' + type.replace('2', ''));
		return item;
	};

	self.parse_cache = function(tmp) {
		return (tmp.left || 0) + 'x' + (tmp.top || 0) + 'x' + (tmp.width || 0) + 'x' + (tmp.height || 0) + 'x';
	};

	self.make = function() {
		self.find('> *').each(function() {
			var el = $(this);
			var type = el.attrd('type');
			switch (type) {
				case 'top':
				case 'top2':
					top = self.parse_item(el);
					break;
				case 'bottom':
				case 'bottom2':
					bottom = self.parse_item(el);
					break;
				case 'right':
					right = self.parse_item(el);
					break;
				case 'left':
					left = self.parse_item(el);
					break;
				default:
					main = self.parse_item(el);
					break;
			}
		});

		self.resize();
	};

	self.resize = function() {
		setTimeout2(self.ID, self.resize2, 50);
	};

	self.show = function(type) {
		if (isMOBILE) {
			switch (type) {
				case 'left':
					left && left.el.css('width', WW).rclass('hidden');
					right && right.el.aclass('hidden');
					break;
				case 'right':
					left && left.el.aclass('hidden');
					right && right.el.css({ left: 0, width: WW }).rclass('hidden');
					break;
				case 'main':
					right && right.el.aclass('hidden');
					left && left.el.aclass('hidden');
					break;
			}
		} else
			self.resize2();
	};

	self.resize2 = function() {

		var parent = self.parent(config.parent);
		var d = WIDTH();
		var w = parent.width();
		var h = parent.height();
		var tmp = d + '_' + w + 'x' + h;

		if (cachesize === tmp)
			return;

		self.css({ width: w, height: h });

		var m = config['margin' + d] || config.margin || 0;

		h -= m;

		cachesize = tmp;
		main.w = w;
		main.h = h;

		var sizetop = top ? self.parse_number(top.size[d], h) : 0;
		var sizebottom = bottom ? self.parse_number(bottom.size[d], h) : 0;
		var sizeleft = left ? self.parse_number(left.size[d], w) : 0;
		var sizeright = right ? self.parse_number(right.size[d], w) : 0;

		if (top) {

			if (top.type === 'top2') {
				top.css.left = sizeleft;
				top.css.width = w - sizeright - sizeleft;
			} else {
				top.css.left = 0;
				top.css.width = w;
			}

			top.css.top = 0;
			top.css.height = sizetop;
			tmp = self.parse_cache(top.css);
			if (tmp !== top.sizecache) {
				top.sizecache = tmp;
				top.el.tclass('hidden', !sizetop);
				if (!sizetop)
					delete top.css.height;
				top.el.css(top.css);
				top.scrollbar && top.scrollbar.resize(sizetop);
			}
		}

		if (bottom) {

			if (bottom.type === 'bottom2') {
				bottom.css.left = sizeleft;
				bottom.css.width = w - sizeright - sizeleft;
			} else {
				bottom.css.left = 0;
				bottom.css.width = w;
			}

			bottom.css.top = h - sizebottom;
			bottom.css.height = sizebottom;
			tmp = self.parse_cache(bottom.css);
			if (tmp !== bottom.sizecache) {
				bottom.el.tclass('hidden', !sizebottom);
				if (!sizebottom)
					delete bottom.css.height;
				bottom.sizecache = tmp;
				bottom.el.css(bottom.css);
				bottom.scrollbar && bottom.scrollbar.resize(sizebottom);
			}
		}

		if (left) {

			if (top && top.type === 'top')
				left.css.top = sizetop;
			else
				left.css.top = 0;

			if (bottom && bottom.type === 'bottom')
				left.css.height = h - sizebottom;
			else
				left.css.height = h;

			if (top && top.type === 'top')
				left.css.height -= sizetop;

			left.css.left = 0;
			left.css.width = sizeleft;
			tmp = self.parse_cache(left.css);
			if (tmp !== left.sizecache) {
				left.el.tclass('hidden', !sizeleft);
				if (!sizeleft)
					delete left.css.width;
				left.sizecache = tmp;
				left.el.css(left.css);
				left.scrollbar && left.scrollbar.resize(left.css.height);
			}
		}

		if (right) {

			if (top && top.type === 'top')
				right.css.top = sizetop;
			else
				right.css.top = 0;

			if (bottom && bottom.type === 'bottom')
				right.css.height = h - sizebottom;
			else
				right.css.height = h;

			if (top && top.type === 'top')
				right.css.height -= sizetop;

			right.css.left = w - sizeright;
			right.css.width = sizeright;
			tmp = self.parse_cache(right.css);
			if (tmp !== right.sizecache) {
				right.el.tclass('hidden', !sizeright);
				if (!sizeright)
					delete right.css.width;
				right.sizecache = tmp;
				right.el.css(right.css);
				right.scrollbar && right.scrollbar.resize(right.css.height);
			}
		}

		if (main) {
			main.css.top = sizetop;
			main.css.left = sizeleft;
			main.css.width = (w - sizeleft - sizeright);
			main.css.height = h - sizetop - sizebottom;
			tmp = self.parse_cache(main.css);
			if (tmp !== main.sizecache) {
				main.sizecache = tmp;
				main.el.css(main.css);
				main.scrollbar && main.scrollbar.resize(main.css.height);
			}
		}

		if (!init) {
			self.rclass('invisible hidden');
			init = true;
		}

		self.element.SETTER('*/resize');
	};

	self.resizescrollbars = function() {
		top && top.scrollbar && top.scrollbar.instance.resize();
		bottom && bottom.scrollbar && bottom.scrollbar.instance.resize();
		left && left.scrollbar && left.scrollbar.instance.resize();
		right && right.scrollbar && right.scrollbar.instance.resize();
		main && main.scrollbar && main.scrollbar.instance.resize();
	};

	self.resizescrollbar = function(type) {
		if (type === 'top')
			top && top.scrollbar && top.scrollbar.instance.resize();
		else if (type === 'bottom')
			bottom && bottom.scrollbar && bottom.scrollbar.instance.resize();
		else if (type === 'left')
			left && left.scrollbar && left.scrollbar.instance.resize();
		else if (type === 'right')
			right && right.scrollbar && right.scrollbar.instance.resize();
		else if (type === 'main')
			main && main.scrollbar && main.scrollbar.instance.resize();
	};

	self.scrolltop = function(type) {
		if (type === 'top')
			top && top.scrollbar && top.scrollbar.instance.scrollTop(0);
		else if (type === 'bottom')
			bottom && bottom.scrollbar && bottom.scrollbar.instance.scrollTop(0);
		else if (type === 'left')
			left && left.scrollbar && left.scrollbar.instance.scrollTop(0);
		else if (type === 'right')
			right && right.scrollbar && right.scrollbar.instance.scrollTop(0);
		else if (type === 'main')
			main && main.scrollbar && main.scrollbar.instance.scrollTop(0);
	};

});

COMPONENT('loading', function(self, config, cls) {

	var delay;
	var prev;

	self.readonly();
	self.singleton();
	self.nocompile();

	self.make = function() {
		self.aclass(cls + ' ' + cls + '-' + (config.style || 1));
		self.append('<div><div class="' + cls + '-text hellip"></div></div>');
	};

	self.show = function(text) {
		clearTimeout(delay);

		if (prev !== text) {
			prev = text;
			self.find('.' + cls + '-text').html(text || '');
		}

		self.rclass('hidden');
		return self;
	};

	self.hide = function(timeout) {
		clearTimeout(delay);
		delay = setTimeout(function() {
			self.aclass('hidden');
		}, timeout || 1);
		return self;
	};

});

COMPONENT('message', 'button:OK', function(self, config, cls) {

	var cls2 = '.' + cls;
	var is, visible = false;
	var events = {};

	self.readonly();
	self.singleton();
	self.nocompile && self.nocompile();

	self.make = function() {

		var pls = (config.style === 2 ? (' ' + cls + '2') : '');
		self.aclass(cls + ' hidden' + pls);
		self.event('click', 'button', self.hide);
	};

	events.keyup = function(e) {
		if (e.which === 27)
			self.hide();
	};

	events.bind = function() {
		if (!events.is) {
			$(W).on('keyup', events.keyup);
			events.is = false;
		}
	};

	events.unbind = function() {
		if (events.is) {
			events.is = false;
			$(W).off('keyup', events.keyup);
		}
	};

	self.warning = function(message, icon, fn) {
		if (typeof(icon) === 'function') {
			fn = icon;
			icon = undefined;
		}
		self.callback = fn;
		self.content(cls + '-warning', message, icon || 'warning');
	};

	self.info = function(message, icon, fn) {
		if (typeof(icon) === 'function') {
			fn = icon;
			icon = undefined;
		}
		self.callback = fn;
		self.content(cls + '-info', message, icon || 'info-circle');
	};

	self.success = function(message, icon, fn) {

		if (typeof(icon) === 'function') {
			fn = icon;
			icon = undefined;
		}

		self.callback = fn;
		self.content(cls + '-success', message, icon || 'check-circle');
	};

	self.response = function(message, callback, response) {

		var fn;

		if (typeof(message) === 'function') {
			response = callback;
			fn = message;
			message = null;
		} else if (typeof(callback) === 'function')
			fn = callback;
		else {
			response = callback;
			fn = null;
		}

		if (response instanceof Array) {
			var builder = [];
			for (var i = 0; i < response.length; i++) {
				var err = response[i].error;
				err && builder.push(err);
			}
			self.warning(builder.join('<br />'));
			SETTER('!loading/hide');
		} else if (typeof(response) === 'string') {
			self.warning(response);
			SETTER('!loading/hide');
		} else {
			message && self.success(message);
			fn && fn(response);
		}
	};

	self.hide = function() {
		events.unbind();
		self.callback && self.callback();
		self.aclass('hidden');
		visible = false;
	};

	self.content = function(classname, text, icon) {

		if (icon.indexOf(' ') === -1)
			icon = 'fa fa-' + icon;

		!is && self.html('<div><div class="{0}-icon"><i class="{1}"></i></div><div class="{0}-body"><div class="{0}-text"></div><hr /><button>{2}</button></div></div>'.format(cls, icon, config.button));
		visible = true;
		self.rclass2(cls + '-').aclass(classname);
		self.find(cls2 + '-body').rclass().aclass(cls + '-body');

		if (is)
			self.find(cls2 + '-icon').find('.fa').rclass2('fa').aclass(icon);

		self.find(cls2 + '-text').html(text);
		self.rclass('hidden');
		is = true;
		events.bind();
		setTimeout(function() {
			self.aclass(cls + '-visible');
			setTimeout(function() {
				self.find(cls2 + '-icon').aclass(cls + '-icon-animate');
			}, 300);
		}, 100);
	};
});

COMPONENT('validation', 'delay:100;flags:visible', function(self, config, cls) {

	var path, elements = null;
	var def = 'button[name="submit"]';
	var flags = null;
	var tracked = false;
	var reset = 0;
	var old, track;

	self.readonly();

	self.make = function() {
		elements = self.find(config.selector || def);
		path = self.path.replace(/\.\*$/, '');
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'selector':
				if (!init)
					elements = self.find(value || def);
				break;
			case 'flags':
				if (value) {
					flags = value.split(',');
					for (var i = 0; i < flags.length; i++)
						flags[i] = '@' + flags[i];
				} else
					flags = null;
				break;
			case 'track':
				track = value.split(',').trim();
				break;
		}
	};

	var settracked = function() {
		tracked = 0;
	};

	self.setter = function(value, path, type) {

		var is = path === self.path || path.length < self.path.length;

		if (reset !== is) {
			reset = is;
			self.tclass(cls + '-modified', !reset);
		}

		if ((type === 1 || type === 2) && track && track.length) {
			for (var i = 0; i < track.length; i++) {
				if (path.indexOf(track[i]) !== -1) {
					tracked = 1;
					return;
				}
			}
			if (tracked === 1) {
				tracked = 2;
				setTimeout(settracked, config.delay * 3);
			}
		}
	};

	var check = function() {
		var disabled = tracked ? !VALID(path, flags) : DISABLED(path, flags);
		if (!disabled && config.if)
			disabled = !EVALUATE(self.path, config.if);
		if (disabled !== old) {
			elements.prop('disabled', disabled);
			self.tclass(cls + '-ok', !disabled);
			self.tclass(cls + '-no', disabled);
			old = disabled;
		}
	};

	self.state = function(type, what) {
		if (type === 3 || what === 3)
			tracked = 0;
		setTimeout2(self.ID, check, config.delay);
	};

});

COMPONENT('treeview', 'parent:parent;droppable:1;movable:1;expanded:0;autosort:1;margin:0;cachexpand:1;arrows:1;visibleY:1;parentselectable:1', function(self, config, cls) {

	var events = {};
	var cls2 = '.' + cls;
	var init = false;
	var items, container, prevselected, draggable, isdragged, skip = false;
	var cache = {};

	self.make = function() {
		self.template = Tangular.compile(('<div class="{0}-item{{ if item.classname }} {{ item.classname }}{{ fi }}" data-id="{{ id }}">' + (config.arrows ? '<i class="{0}-arrow fa"></i>' : '') + '<div>{{ if item.html }}{{ item.html | raw }}{{ else }}{{ item.name }}{{ fi }}</div></div>').format(cls));
		self.aclass(cls);
		self.append('<div class="{0}-scrollbar"><div class="{0}-container"></div></div>'.format(cls));
		container = self.find(cls2 + '-container')[0];
		self.scrollbar = new SCROLLBAR(self.find(cls2 + '-scrollbar'), { visibleY: config.visibleY, orientation: 'y' });

		var dblclick = {};

		var item_click = function(el) {

			dblclick.element = null;

			if (config.disabled)
				return;

			// var parent = el.parent();
			// if (parent.hclass(cls + '-canexpand'))
			// return;

			var parent = el.parent();
			var item = parent[0].$treeview.item;
			var classname = cls + '-selected';

			if (el.hclass(cls + '-selected') && item.children) {
				if (parent.hclass(cls + '-canexpand')) {
					parent.tclass(cls + '-open');
					self.scrollbar.resize();
					var is = parent.hclass(cls + '-open');
					if (config.cachexpand)
						cache[parent[0].$treeview.id] = is;

					if (is && config.parentselectable) {
						prevselected && prevselected.rclass(classname);
						prevselected = parent.find('> ' + cls2 + '-item:first-child').aclass(classname);
					}

					if (config.parentselectable) {
						prevselected && prevselected.rclass(classname);
						prevselected = parent.find('> ' + cls2 + '-item:first-child').aclass(classname);
					}

					return;
				}
			}

			prevselected && prevselected.rclass(classname);
			prevselected = el.aclass(classname);
			config.exec && SEEX(self.makepath(config.exec), item, false);
		};

		config.contextmenu && self.event('contextmenu', cls2 + '-item', function(e) {
			e.stopPropagation();
			e.preventDefault();
			var el = $(this);
			var classname = cls + '-selected';

			prevselected && prevselected.rclass(classname);
			prevselected = el.aclass(classname);

			SEEX(self.makepath(config.contextmenu), el.parent()[0].$treeview.item, el);
		});

		self.event('click', cls2 + '-item', function(e) {

			e.stopPropagation();

			if (dblclick.op) {
				clearTimeout(dblclick.op);
				dblclick.op = null;
			}

			var el = $(this);
			var classname = cls + '-selected';

			if (!config.dblclick || dblclick.element !== this) {
				dblclick.element = this;
				dblclick.ts = Date.now();
				dblclick.op = setTimeout(item_click, 200, el);
			} else {

				var parent = el.parent();
				dblclick.element = null;
				dblclick.op = null;

				if (config.parentselectable) {
					prevselected && prevselected.rclass(classname);
					prevselected = parent.find('> ' + cls2 + '-item:first-child').aclass(classname);
				}

				SEEX(self.makepath(config.dblclick), el.parent()[0].$treeview.item);
			}

		});

		if (config.droppable || config.movable) {
			self.event('dragenter dragover dragexit drop dragleave dragstart', cls2 + '-item-container', events.ondrag);
			self.event('mousedown', cls2 + '-item-container', events.ondown);
		}

		$(W).on('resize', self.resize2);
		self.on('resize', self.resize2);
		self.resize();
		self.resize2();
	};

	self.resize2 = function() {
		setTimeout2(self.ID, self.resize, 300);
	};

	self.destroy = function() {
		$(W).off('resize', self.resize2);
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'disabled':
				self.tclass('ui-disabled', !!value);
				break;
		}
	};

	events.ondrag = function(e) {

		if (!draggable || config.disabled)
			return;

		if (e.type !== 'dragstart')
			e.preventDefault();

		switch (e.type) {
			case 'drop':

				e.stopPropagation();
				events.onup();
				$(draggable).rclass(cls + '-dragged');

				var target = e.target;
				var a = draggable;
				var b = $(target);
				var classname = cls + '-item-container';

				if (!b.hclass(classname))
					b = b.closest('.' + classname);

				if (b[0] === a)
					return;

				if (!b.hclass(cls + '-candrop'))
					return;

				var children = b.find('> ' + cls2 + '-children')[0];

				// Checks if the parent isn't dropped into the child
				while (true) {
					target = target.parentNode;
					if (target === self.dom)
						break;
					if (target === a)
						return;
				}

				if (!b.hclass(cls + '-canexpand'))
					b.aclass('{0}-canexpand {0}-open'.format(cls));

				var item = a.$treeview;
				var refparent = a.parentNode.parentNode.$treeview;
				var reftarget = b[0].$treeview;

				var parent = a.parentNode;
				children.appendChild(a);

				if (!parent.children.length)
					$(parent.parentNode).rclass('{0}-canexpand {0}-open'.format(cls));

				config.autosort && self.sort(children);

				var index = refparent.item.children.indexOf(item.item);
				refparent.item.children.splice(index, 1);
				reftarget.item.children.push(item.item);
				config.move && EXEC(self.makepath(config.move), item.item, reftarget.item, refparent.item);
				skip = true;
				self.update(true);
				self.change(true);
				break;

			case 'dragstart':
				var eo = e.originalEvent;
				eo.dataTransfer && eo.dataTransfer.setData('text', '1');
				break;

			case 'dragenter':
			case 'dragover':
			case 'dragleave':
			case 'dragexit':
				break;
		}
	};

	events.ondown = function(e) {

		if (config.disabled)
			return;

		e.stopPropagation();

		var el = $(this);
		if (el.hclass(cls + '-canmove')) {
			draggable = this;

			setTimeout2(self.ID + 'down', function() {
				isdragged = true;
				el.aclass(cls + '-dragged');
			}, 200);

			$(document).on('mouseup', events.onup);
		}

	};

	events.onup = function() {
		clearTimeout2(self.ID + 'down');
		if (isdragged) {
			isdragged = false;
			$(draggable).rclass(cls + '-dragged');
		}
		$(document).off('mouseup', events.onup);
	};

	self.sort = function(container) {

		var items = [];
		var backup = document.createElement('DIV');

		while (container.children.length) {
			var item = container.children[0];
			var reference = item.$treeview;
			$(item).rclass(cls + '-last');
			items.push({ node: item, sort: reference.item.sort || reference.item.name });
			backup.appendChild(item);
		}

		items.quicksort('sort');

		var length = items.length;
		for (var i = 0; i < length; i++) {
			var last = i === length - 1;
			container.appendChild(items[i].node);
			last && $(items[i].node).aclass(cls + '-last');
		}
	};

	var css = {};

	self.resize = function(scrolltop) {

		if (self.release())
			return;

		var el = self.parent(config.parent);
		var h = el.height();
		var margin = config.margin;
		var width = WIDTH();
		var responsivemargin = config['margin' + width];

		if (responsivemargin != null)
			margin = responsivemargin;

		if (h === 0) {
			self.$waiting && clearTimeout(self.$waiting);
			self.$waiting = setTimeout(self.resize, 234);
			return;
		}

		css.height = h - margin;
		self.find(cls2 + '-scrollbar,' + cls2 + '-container').css(css);
		self.css(css);
		self.scrollbar && self.scrollbar.resize();
		scrolltop && self.scrolltop(0);

		if (!init) {
			self.rclass('invisible', 250);
			init = true;
		}
	};

	self.replacenode = function(parent, item, level, last) {

		// { id: '', icon: '', iconopen: '', name: '', items: [], classname: '', actions: { move: 1, drop: 1, expand: 1 }}

		var obj = items[item.id];

		if (!obj) {
			obj = {};
			obj.id = item.id;
			items[item.id] = obj;
		}

		var actions = item.actions || EMPTYOBJECT;
		var achildren = item.children && item.children.length;
		var wrapper = document.createElement('DIV');

		var classes = cls + '-item-container';

		if (achildren)
			classes += ' ' + cls + '-canexpand' ;

		if (achildren && (config.expanded || actions.expand) && cache[item.id] !== false)
			classes += ' ' + cls + '-open';

		if (config.movable && actions.move !== false)
			classes += ' ' + cls + '-canmove';

		if (config.droppable && actions.drop !== false)
			classes += ' ' + cls + '-candrop';

		if (last)
			classes += ' ' + cls + '-last';

		wrapper.setAttribute('class', classes);
		obj.item = item;

		var node = $(self.template(obj))[0];
		obj.dom = wrapper;
		obj.dom.$treeview = obj;

		if (config.movable && actions.move !== false)
			wrapper.setAttribute('draggable', 'true');

		wrapper.appendChild(node);
		parent.appendChild(wrapper);

		var div = document.createElement('DIV');
		div.setAttribute('class', cls + '-children');
		wrapper.appendChild(div);

		if (!achildren)
			return;

		var length = item.children.length;

		for (var i = 0; i < length; i++)
			self.replacenode(div, item.children[i], level + '-' + i, (i + 1) === length);

		config.autosort && self.sort(div);
	};

	self.setter = function(value) {

		if (skip) {
			skip = false;
			return;
		}

		items = {};

		while (container.children.length)
			container.removeChild(container.children[0]);

		if (!value) {
			self.scrollbar.resize();
			return;
		}

		var length = value.length;
		for (var i = 0; i < length; i++) {
			var item = value[i];
			self.replacenode(container, item, '0-' + i, (i + 1) === length);
		}

		self.scrollbar.resize();
	};

});

COMPONENT('navigation', 'pk:id', function(self, config, cls) {

	var cls2 = '.' + cls;
	var current, items, open = {};

	self.readonly();
	self.nocompile && self.nocompile();

	self.unselect = function() {
		if (current) {
			current.rclass(cls + '-selected');
			current = null;
		}
	};

	self.make = function() {
		self.aclass(cls);

		self.event('click', 'b', function(e) {
			var el = $(this);
			config.options && EXEC(config.options, items[el.closest(cls2 + '-item').attrd('id')], el);
			e.preventDefault();
			e.stopPropagation();
		});

		self.event('click', cls2 + '-link', function() {
			var el = $(this);
			var parent = el.parent();
			var index = parent.attrd('id');

			if (el.hclass(cls + '-children')) {
				if (parent.hclass(cls + '-selected')) {
					parent.tclass(cls + '-show');
					current && current.rclass(cls + '-selected');
					current = parent;
				} else if (!parent.hclass(cls + '-show'))
					parent.aclass(cls + '-show');

				if (parent.hclass(cls + '-show')) {
					parent.aclass(cls + '-selected');
					current && current.rclass(cls + '-selected');
					current = parent;
					EXEC(config.exec, items[index]);
					if (config.pk)
						open.selected = items[index][config.pk];
				}

			} else {
				current && current.rclass(cls + '-selected');
				current = parent;
				parent.aclass(cls + '-selected');
				EXEC(config.exec, items[index]);
				if (config.pk)
					open.selected = items[index][config.pk];
			}

			if (config.pk)
				open[items[index][config.pk]] = parent.hclass(cls + '-selected');
		});
	};

	self.setter = function(value) {

		if (!value || !value.length)
			return;

		var indexer = 0;
		var selectedindex = -1;

		items = {};

		var render = function(children, level) {

			var builder = [];

			for (var i = 0; i < children.length; i++) {

				indexer++;

				var item = children[i];
				var childs = item.children && item.children.length;

				if (config.pk) {
					if (open.selected && item[config.pk] === open.selected)
						selectedindex = indexer;
					if (item.collapsed && open[item[config.pk]])
						item.collapsed = false;
				}

				var o = '<div class="ui-navigation-item ui-navigation-level-{0}{1}" title="{2}" data-id="{3}">'.format(level, childs && !item.collapsed ? ' ' + cls + '-show' : '', item.title, indexer);
				o += '<span class="ui-navigation-link{1}">{2}<i class="{3}"></i>{0}</span>'.format(item.name, childs ? ' ui-navigation-children' : '', item.options ? '<b><i class="fa fa-ellipsis-h"></i></b>' : '', item.icon);

				items[indexer] = item;

				if (childs) {
					item.children.quicksort('treeorder');
					o += '<div class="' + cls + '-level">';
					o += render(item.children, level + 1);
					o += '</div>';
				}

				o += '</div>';
				builder.push(o);
			}

			return builder.join('');
		};

		current = null;
		self.html(render(value, 0));

		if (selectedindex !== -1)
			self.find(cls2 + '-item[data-id="{0}"]'.format(selectedindex)).aclass(cls + '-selected');
		else if (config.autoselect)
			self.find(cls2 + '-item:first-child').eq(0).find(cls2 + '-link').trigger('click');
	};
});

COMPONENT('datagrid', 'checkbox:true;colwidth:150;rowheight:28;minheight:200;clusterize:true;limit:80;filterlabel:Filter;height:auto;margin:0;resize:true;reorder:true;sorting:true;boolean:true,on,yes;pluralizepages:# pages,# page,# pages,# pages;pluralizeitems:# items,# item,# items,# items;remember:true;highlight:false;unhighlight:true;autoselect:false;buttonapply:Apply;buttonreset:Reset;allowtitles:false;fullwidth_xs:true;clickid:id;dirplaceholder:Search;autoformat:1;controls:1', function(self, config) {

	var opt = { filter: {}, filtercache: {}, filtercl: {}, filtervalues: {}, scroll: false, selected: {}, operation: '' };
	var header, vbody, footer, container, ecolumns, isecolumns = false, ready = false;
	var sheader, sbody, econtrols;
	var Theadercol = Tangular.compile('<div class="dg-hcol dg-col-{{ index }}{{ if sorting }} dg-sorting{{ fi }}" data-index="{{ index }}">{{ if sorting }}<i class="dg-sort fa fa-sort"></i>{{ fi }}<div class="dg-label{{ alignheader }}"{{ if labeltitle }} title="{{ labeltitle }}"{{ fi }}{{ if reorder }} draggable="true"{{ fi }}>{{ label | raw }}</div>{{ if filter }}<div class="dg-filter{{ alignfilter }}{{ if filterval != null && filterval !== \'\' }} dg-filter-selected{{ fi }}"><i class="fa dg-filter-cancel fa-times"></i>{{ if options }}<label data-name="{{ name }}">{{ if filterval }}{{ filterval }}{{ else }}{{ filter }}{{ fi }}</label>{{ else }}<input autocomplete="new-password" type="text" placeholder="{{ filter }}" class="dg-filter-input" name="{{ name }}{{ ts }}" data-name="{{ name }}" value="{{ filterval }}" />{{ fi }}</div>{{ else }}<div class="dg-filter-empty">&nbsp;</div>{{ fi }}</div>');
	var isIE = (/msie|trident/i).test(navigator.userAgent);
	var isredraw = false;
	var forcescroll = '';
	var schemas = {};
	var controls = { el: null, timeout: null, is: false, cache: {} };

	self.meta = opt;

	function Cluster(el) {

		var self = this;
		var dom = el[0];
		var scrollel = el;

		self.row = config.rowheight;
		self.rows = [];
		self.limit = config.limit;
		self.pos = -1;
		self.enabled = !!config.clusterize;
		self.plus = 0;
		self.scrolltop = 0;
		self.prev = 0;

		var seh = '<div style="height:0"></div>';
		var set = $(seh);
		var seb = $(seh);

		var div = document.createElement('DIV');
		dom.appendChild(set[0]);
		dom.appendChild(div);
		dom.appendChild(seb[0]);
		self.el = $(div);

		self.render = function() {

			var t = self.pos * self.frame;
			var b = (self.rows.length * self.row) - (self.frame * 2) - t;
			var pos = self.pos * self.limit;
			var posto = pos + (self.limit * 2);

			set.css('height', t);
			seb.css('height', b < 2 ? isMOBILE ? (config.exec ? (self.row + 1) : (self.row * 2.25)) >> 0 : 3 : b);

			var tmp = self.scrollbar[0].scrollTop;
			var node = self.el[0];
			// node.innerHTML = '';

			var child = node.firstChild;

			while (child) {
				node.removeChild(child);
				child = node.firstChild;
			}

			for (var i = pos; i < posto; i++) {
				if (typeof(self.rows[i]) === 'string')
					self.rows[i] = $(self.rows[i])[0];

				if (self.rows[i])
					node.appendChild(self.rows[i]);
				else
					break;
			}

			if (self.prev < t)
				self.scrollbar[0].scrollTop = t;
			else
				self.scrollbar[0].scrollTop = tmp;

			self.prev = t;

			if (self.grid.selected) {
				var index = opt.rows.indexOf(self.grid.selected);
				if (index !== -1 && (index >= pos || index <= (pos + self.limit)))
					self.el.find('.dg-row[data-index="{0}"]'.format(index)).aclass('dg-selected');
			}
		};

		self.scrolling = function() {

			var y = self.scrollbar[0].scrollTop + 1;
			self.scrolltop = y;

			if (y < 0)
				return;

			var frame = Math.ceil(y / self.frame) - 1;
			if (frame === -1)
				return;

			if (self.pos !== frame) {

				// The content could be modified
				var plus = (self.el[0].offsetHeight / 2) - self.frame;
				if (plus > 0) {
					frame = Math.ceil(y / (self.frame + plus)) - 1;
					if (self.pos === frame)
						return;
				}

				if (self.max && frame >= self.max)
					frame = self.max;

				self.pos = frame;

				if (self.enabled)
					self.render();
				else {

					var node = self.el[0];
					var child = node.firstChild;

					while (child) {
						node.removeChild(child);
						child = node.firstChild;
					}

					for (var i = 0; i < self.rows.length; i++) {
						if (typeof(self.rows[i]) === 'string')
							self.rows[i] = $(self.rows[i])[0];
						self.el[0].appendChild(self.rows[i]);
					}
				}

				self.scroll && self.scroll();
				config.change && self.grid.SEEX(config.change, null, null, self.grid);
			}
		};

		self.update = function(rows, noscroll) {

			if (noscroll != true)
				self.el[0].scrollTop = 0;

			self.limit = config.limit;
			self.pos = -1;
			self.rows = rows;
			self.max = Math.ceil(rows.length / self.limit) - 1;
			self.frame = self.limit * self.row;

			if (!self.enabled) {
				self.frame = 1000000;
			} else if (self.limit * 2 > rows.length) {
				self.limit = rows.length;
				self.frame = self.limit * self.row;
				self.max = 1;
			}

			self.scrolling();
		};

		self.destroy = function() {
			self.el.off('scroll');
			self.rows = null;
		};

		self.scrollbar = scrollel.closest('.ui-scrollbar-area');
		self.scrollbar.on('scroll', self.scrolling);
	}

	self.destroy = function() {
		opt.cluster && opt.cluster.destroy();
	};

	// opt.cols    --> columns
	// opt.rows    --> raw rendered data
	// opt.render  --> for cluster

	self.init = function() {

		ON('resize + resize2', function() {
			setTimeout2('datagridresize', function() {
				SETTER('datagrid/resize');
			}, 500);
		});

		Thelpers.ui_datagrid_autoformat = function(val, type) {

			switch (type) {
				case 'email':
					return val && val.length > 2 ? '<a href="mailto:{0}" class="dg-link"><i class="far fa-envelope"></i>{0}</a>'.format(val) : val;
				case 'phone':
					return val && val.length > 2 ? '<a href="tel:{0}" class="dg-link"><i class="fas fa-phone"></i>{0}</a>'.format(val) : val;
				case 'url':
					return val && val.length > 7 && (/http(s):\/\//i).test(val) ? '<a href="{0}" target="_blank" class="dg-link"><i class="fas fa-globe"></i>{0}</a>'.format(val) : val;
			}

			return val;
		};

		Thelpers.ui_datagrid_checkbox = function(val) {
			return '<div class="dg-checkbox' + (val ? ' dg-checked' : '') + '" data-custom="1"><i class="fa fa-check"></i></div>';
		};

		Thelpers.ui_datagrid_colorize = function(val, encode) {
			var hash = HASH(val + '');
			var color = '#';
			for (var i = 0; i < 3; i++) {
				var value = (hash >> (i * 8)) & 0xFF;
				color += ('00' + value.toString(16)).substr(-2);
			}
			return '<span style="background:{0}" class="dg-colorize">{1}</span>'.format(color, encode ? Thelpers.encode(val) : val);
		};
	};

	self.readonly();
	self.bindvisible();
	self.nocompile();

	var reconfig = function() {
		self.tclass('dg-clickable', !!(config.click || config.dblclick));
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'noborder':
				self.tclass('dg-noborder', !!value);
				break;
			case 'checkbox':
			case 'numbering':
				!init && self.cols(NOOP);
				break;
			case 'pluralizepages':
				config.pluralizepages = value.split(',').trim();
				break;
			case 'pluralizeitems':
				config.pluralizeitems = value.split(',').trim();
				break;
			case 'checked':
			case 'button':
			case 'exec':
				if (value && value.SCOPE)
					config[key] = value.SCOPE(self, value);
				break;
			case 'dblclick':
				if (value && value.SCOPE)
					config.dblclick = value.SCOPE(self, value);
				break;
			case 'click':
				if (value && value.SCOPE)
					config.click = value.SCOPE(self, value);
				break;
			case 'columns':
				self.datasource(value, function(path, value, type) {
					if (value) {
						opt.sort = null;
						opt.filter = {};
						opt.scroll = '';
						opt.selected = {};
						self.rebind(value, true);
						type && self.setter(null);
					}
				});
				break;
		}

		setTimeout2(self.ID + 'reconfigure', reconfig);
	};

	self.refresh = function() {
		self.refreshfilter();
	};

	self.applycolumns = function(use) {
		isecolumns = false;
		ecolumns.aclass('hidden');
		if (use) {
			var nothidden = {};
			ecolumns.find('.dg-columns-checkbox-checked').each(function() {
				nothidden[this.getAttribute('data-id')] = true;
			});
			self.cols(function(cols) {
				for (var i = 0; i < cols.length; i++) {
					var col = cols[i];
					col.hidden = nothidden[col.id] !== true;
				}
			});
		}
	};

	self.fn_in_changed = function(arr) {
		config.changed && self.SEEX(config.changed, arr || self.changed(), self);
	};

	self.fn_in_checked = function(arr) {
		config.checked && self.SEEX(config.checked, arr || self.checked(), self);
	};

	self.fn_refresh = function() {
		setTimeout2(self.ID + 'filter', function() {
			if (config.exec)
				self.operation(opt.operation);
			else
				self.refreshfilter(true);
		}, 50);
	};

	self.make = function() {

		self.IDCSS = GUID(5);
		self.aclass('dg dg-noscroll dg-' + self.IDCSS + (config.height === 'fluid' ? ' dg-fluid' : ''));

		self.find('script').each(function() {
			var el = $(this);
			var id = el.attrd('id');

			if (id)
				schemas[id] = el.html();

			if (!schemas.default)
				schemas.default = el.html();

		});

		controls.show = function(dom) {

			if (controls.ishidding || !opt.controls || !config.controls)
				return;

			var el = $(dom);
			var off = el.position();
			var css = {};
			var clshover = 'dg-row-hover';
			var index = el.attrd('index');
			controls.el && controls.el.rclass(clshover);
			controls.el = $(dom).aclass(clshover);

			var div = controls.cache[index];

			if (div === null) {
				controls.hide();
				return;
			}

			if (!div) {
				var html = opt.controls(opt.rows[+index]);
				div = controls.cache[index] = html ? $('<div>' + html + '</div>')[0] : null;
				controls.cache[index] = div;
				if (div === null) {
					controls.hide();
					return;
				}
			}

			while (true) {
				var child = econtrols[0].firstChild;
				if (child)
					econtrols[0].removeChild(child);
				else
					break;
			}

			econtrols[0].appendChild(div);
			css.top = Math.ceil(off.top - ((econtrols.height() / 2) - (config.rowheight / 2))) - 2;
			econtrols.css(css).rclass('hidden').aclass('dg-controls-visible', 50).attrd('index', index);
			controls.timeout = null;
			controls.is = true;
			controls.y = self.scrollbarY.scrollTop();
		};

		controls.hide = function(type) {
			if (controls.is) {

				// scrollbar
				if (type === 1) {
					var y = self.scrollbarY.scrollTop();
					if (controls.y === y)
						return;
				} else if (type === 2) {
					controls.ishidding = true;
					setTimeout(function() {
						controls.ishidding = false;
					}, 1000);
				}

				controls.el.rclass('dg-row-hover');
				controls.el = null;
				controls.is = false;
				econtrols.aclass('hidden').rclass('dg-controls-visible');
			}
		};

		ON('scroll', function() {
			controls.hide(1);
		});

		self.event('mouseenter', '.dg-row', function(e) {
			controls.timeout && clearTimeout(controls.timeout);
			controls.timeout = setTimeout(controls.show, controls.is ? 50 : 500, this, e);
		});

		var pagination = '';
		if (config.exec)
			pagination = '<div class="dg-footer hidden"><div class="dg-pagination-items hidden-xs"></div><div class="dg-pagination"><button name="page-first" disabled><i class="fa fa-angle-double-left"></i></button><button name="page-prev" disabled><i class="fa fa-angle-left"></i></button><div><input type="text" name="page" maxlength="5" class="dg-pagination-input" /></div><button name="page-next" disabled><i class="fa fa-angle-right"></i></button><button name="page-last" disabled><i class="fa fa-angle-double-right"></i></button></div><div class="dg-pagination-pages"></div></div>';

		self.dom.innerHTML = '<div class="dg-btn-columns"><i class="fa fa-caret-left"></i><span class="fa fa-columns"></span></div><div class="dg-columns hidden"><div><div class="dg-columns-body"></div></div><button class="dg-columns-button" name="columns-apply"><i class="fa fa-check-circle"></i>{1}</button><span class="dt-columns-reset">{2}</span></div><div class="dg-container"><div class="dg-controls"></div><span class="dg-resize-line hidden"></span><div class="dg-header-scrollbar"><div class="dg-header"></div><div class="dg-body-scrollbar"><div class="dg-body"></div></div></div></div>{0}'.format(pagination, config.buttonapply, config.buttonreset);

		header = self.find('.dg-header');
		vbody = self.find('.dg-body');
		footer = self.find('.dg-footer');
		container = self.find('.dg-container');
		ecolumns = self.find('.dg-columns');
		sheader = self.find('.dg-header-scrollbar');
		sbody = self.find('.dg-body-scrollbar');
		econtrols = self.find('.dg-controls');

		container.on('mouseleave', function() {
			controls.hide(2);
		});

		self.scrollbarY = config.height !== 'fluid' ? SCROLLBAR(sbody, { visibleY: true, orientation: 'y', controls: container, marginY: isMOBILE ? 0 : 54 }) : null;
		self.scrollbarX = SCROLLBAR(sheader, { visibleX: true, orientation: 'x', controls: container });

		if (schemas.default) {
			self.rebind(schemas.default);
			schemas.$current = 'default';
		}

		var events = {};

		events.mouseup = function(e) {
			if (r.is) {
				r.is = false;
				r.line.aclass('hidden');
				r.el.css('height', r.h);
				var x = r.el.css('left').parseInt();
				var index = +r.el.attrd('index');
				var width = opt.cols[index].width + (x - r.x);
				self.resizecolumn(index, width);
				e.preventDefault();
				e.stopPropagation();
			}
			events.unbind();
		};

		container.on('contextmenu', function(e) {
			if (config.contextmenu) {
				e.preventDefault();
				self.EXEC(config.contextmenu, e, self);
			}
		});

		events.unbind = function() {
			$(W).off('mouseup', events.mouseup).off('mousemove', events.mousemove);
		};

		events.bind = function() {
			$(W).on('mouseup', events.mouseup).on('mousemove', events.mousemove);
		};

		var hidedir = function() {
			ishidedir = true;
			SETTER('!directory', 'hide');
			setTimeout(function() {
				ishidedir = false;
			}, 800);
		};

		var ishidedir = false;
		var r = { is: false };

		self.event('click', '.dg-btn-columns', function(e) {

			e.preventDefault();
			e.stopPropagation();

			controls.hide();

			var cls = 'hidden';
			if (isecolumns) {
				self.applycolumns();
			} else {
				var builder = [];

				for (var i = 0; i < opt.cols.length; i++) {
					var col = opt.cols[i];
					(col.listcolumn && !col.$hidden) && builder.push('<div><label class="dg-columns-checkbox{1}" data-id="{0}"><span><i class="fa fa-check"></i></span>{2}</label></div>'.format(col.id, col.hidden ? '' : ' dg-columns-checkbox-checked', col.text));
				}

				ecolumns.find('.dg-columns-body')[0].innerHTML = builder.join('');
				ecolumns.rclass(cls);
				isecolumns = true;
			}
		});

		header.on('click', 'label', function() {

			var el = $(this);
			var index = +el.closest('.dg-hcol').attrd('index');
			var col = opt.cols[index];
			var opts = col.options instanceof Array ? col.options : GET(col.options);
			var dir = {};

			controls.hide();
			dir.element = el;
			dir.items = opts;
			dir.key = col.otext;
			dir.offsetX = -6;
			dir.offsetY = -2;
			dir.placeholder = config.dirplaceholder;

			dir.callback = function(item) {
				self.applyfilterdirectory(el, col, item);
			};

			SETTER('directory', 'show', dir);
		});

		self.event('dblclick', '.dg-col', function(e) {
			controls.hide();
			e.preventDefault();
			e.stopPropagation();
			self.editcolumn($(this));
		});

		var dblclick = { ticks: 0, id: null, row: null };
		r.line = container.find('.dg-resize-line');

		var findclass = function(node) {
			var count = 0;
			while (true) {
				for (var i = 1; i < arguments.length; i++) {
					if (node.classList.contains(arguments[i]))
						return true;
				}
				node = node.parentNode;
				if ((count++) > 4)
					break;
			}
		};

		self.event('click', '.dg-row', function(e) {

			var now = Date.now();
			var el = $(this);
			var type = e.target.tagName;
			var target = $(e.target);

			if ((type === 'DIV' || type === 'SPAN')) {

				var cls = 'dg-selected';
				var elrow = el.closest('.dg-row');
				var index = +elrow.attrd('index');
				var row = opt.rows[index];
				if (!row)
					return;

				if (config.dblclick && dblclick.ticks && dblclick.ticks > now && dblclick.row === row && !findclass(e.target, 'dg-checkbox', 'dg-editable')) {
					config.dblclick && self.SEEX(config.dblclick, row, self, elrow, target);
					if (config.highlight && self.selected !== row) {
						opt.cluster.el.find('.' + cls).rclass(cls);
						self.selected = row;
						elrow.aclass(cls);
					}
					e.preventDefault();
					return;
				}

				dblclick.row = row;
				dblclick.ticks = now + 300;

				var rowarg = row;

				if (config.highlight) {
					opt.cluster.el.find('.' + cls).rclass(cls);
					if (!config.unhighlight || self.selected !== row) {
						self.selected = row;
						elrow.aclass(cls);
						controls.show(el[0]);
					} else {
						rowarg = self.selected = null;
						controls.is && controls.hide();
					}
				} else {
					if (controls.is)
						controls.hide();
					else if (rowarg)
						controls.show(el[0]);
				}

				config.click && self.SEEX(config.click, rowarg, self, elrow, target);
			}
		});

		self.reload = function() {
			self.operation('refresh');
		};

		self.empty = function() {
			self.set({ page: 1, pages: 0, count: 0, items: [], limit: 0 });
		};

		self.released = function(is) {
			!is && setTimeout(self.resize, 500);
		};

		self.event('click', '.dg-filter-cancel,.dt-columns-reset', function() {
			var el = $(this);

			controls.hide();

			if (el.hclass('dt-columns-reset'))
				self.resetcolumns();
			else {
				var tmp = el.parent();
				var input = tmp.find('input');
				if (input.length) {
					input.val('');
					input.trigger('change');
					return;
				}

				var label = tmp.find('label');
				if (label.length) {
					tmp.rclass('dg-filter-selected');
					var index = +el.closest('.dg-hcol').attrd('index');
					var col = opt.cols[index];
					var k = label.attrd('name');
					label.html(col.filter);
					forcescroll = opt.scroll = 'y';
					opt.operation = 'filter';
					delete opt.filter[k];
					delete opt.filtervalues[col.id];
					delete opt.filtercl[k];
					self.fn_refresh();
				}
			}
		});

		self.event('click', '.dg-label,.dg-sort', function() {

			var el = $(this).closest('.dg-hcol');

			controls.hide();

			if (!el.find('.dg-sort').length)
				return;

			var index = +el.attrd('index');

			for (var i = 0; i < opt.cols.length; i++) {
				if (i !== index)
					opt.cols[i].sort = 0;
			}

			var col = opt.cols[index];
			switch (col.sort) {
				case 0:
					col.sort = 1;
					break;
				case 1:
					col.sort = 2;
					break;
				case 2:
					col.sort = 0;
					break;
			}

			opt.sort = col;
			opt.operation = 'sort';
			forcescroll = '-';

			if (config.exec)
				self.operation(opt.operation);
			else
				self.refreshfilter(true);
		});

		isIE && self.event('keydown', 'input', function(e) {
			if (e.keyCode === 13)
				$(this).blur();
			else if (e.keyCode === 27)
				$(this).val('');
		});

		self.event('mousedown', function(e) {

			var el = $(e.target);

			if (!el.hclass('dg-resize'))
				return;

			controls.hide();
			events.bind();

			var offset = self.element.offset().left;
			r.el = el;
			r.offset = offset; //offset;

			var prev = el.prev();
			r.min = (prev.length ? prev.css('left').parseInt() : (config.checkbox ? 70 : 30)) + 50;
			r.h = el.css('height');
			r.x = el.css('left').parseInt();
			r.line.css('height', opt.height);
			r.is = true;
			r.isline = false;
			e.preventDefault();
			e.stopPropagation();
		});

		header.on('mousemove', function(e) {
			if (r.is) {
				var x = (e.pageX - r.offset - 10);
				var x2 = self.scrollbarX.scrollLeft() + x;
				if (x2 < r.min)
					x2 = r.min;

				r.el.css('left', x2);
				r.line.css('left', x + 9);

				if (!r.isline) {
					r.isline = true;
					r.line.rclass('hidden');
				}

				e.preventDefault();
				e.stopPropagation();
			}
		});

		self.applyfilterdirectory = function(label, col, item) {

			var val = item[col.ovalue];
			var is = val != null && val !== '';
			var name = label.attrd('name');

			opt.filtervalues[col.id] = val;

			if (is) {
				if (opt.filter[name] == val)
					return;
				opt.filter[name] = val;
			} else
				delete opt.filter[name];

			delete opt.filtercache[name];
			opt.filtercl[name] = val;

			forcescroll = opt.scroll = 'y';
			opt.operation = 'filter';
			label.parent().tclass('dg-filter-selected', is);
			label.text(is ? (item[col.otext] || '') : col.filter);
			self.fn_refresh();
		};

		var d = { is: false };

		self.event('dragstart', function(e) {
			!isIE && e.originalEvent.dataTransfer.setData('text/plain', GUID());
		});

		self.event('dragenter dragover dragexit drop dragleave', function (e) {

			e.stopPropagation();
			e.preventDefault();

			switch (e.type) {
				case 'drop':

					if (d.is) {
						var col = opt.cols[+$(e.target).closest('.dg-hcol').attrd('index')];
						col && self.reordercolumn(d.index, col.index);
					}

					d.is = false;
					break;

				case 'dragenter':
					if (!d.is) {
						d.index = +$(e.target).closest('.dg-hcol').attrd('index');
						d.is = true;
					}
					return;
				case 'dragover':
					return;
				default:
					return;
			}
		});

		self.event('change', '.dg-pagination-input', function() {

			var value = self.get();
			var val = +this.value;

			if (isNaN(val))
				return;

			if (val >= value.pages)
				val = value.pages;
			else if (val < 1)
				val = 1;

			value.page = val;
			forcescroll = opt.scroll = 'y';
			self.operation('page');
			controls.hide();
		});

		self.event('change', '.dg-filter-input', function() {

			var input = this;
			var $el = $(this);
			var el = $el.parent();
			var val = $el.val();
			var name = input.getAttribute('data-name');

			var col = opt.cols[+el.closest('.dg-hcol').attrd('index')];
			delete opt.filtercache[name];
			delete opt.filtercl[name];

			if (col.options) {
				if (val)
					val = (col.options instanceof Array ? col.options : GET(col.options))[+val][col.ovalue];
				else
					val = null;
			}

			var is = val != null && val !== '';

			if (col)
				opt.filtervalues[col.id] = val;

			if (is) {
				if (opt.filter[name] == val)
					return;
				opt.filter[name] = val;
			} else
				delete opt.filter[name];

			forcescroll = opt.scroll = 'y';
			opt.operation = 'filter';
			el.tclass('dg-filter-selected', is);
			self.fn_refresh();
			controls.hide();
		});

		self.select = function(row) {

			var index;

			if (typeof(row) === 'number') {
				index = row;
				row = opt.rows[index];
			} else if (row)
				index = opt.rows.indexOf(row);

			var cls = 'dg-selected';
			if (!row || index === -1) {
				self.selected = null;
				opt.cluster && opt.cluster.el.find('.' + cls).rclass(cls);
				config.highlight && config.click && self.SEEX(config.click, null, self);
				return;
			}

			self.selected = row;

			var elrow = opt.cluster.el.find('.dg-row[data-index="{0}"]'.format(index));
			if (elrow && config.highlight) {
				opt.cluster.el.find('.' + cls).rclass(cls);
				elrow.aclass(cls);
			}

			config.click && self.SEEX(config.click, row, self, elrow, null);
			controls.hide();
		};

		self.event('click', '.dg-checkbox', function() {

			var t = $(this);
			var custom = t.attrd('custom');

			if (custom === '1')
				return;

			t.tclass('dg-checked');

			if (custom === '2')
				return;

			var val = t.attrd('value');
			var checked = t.hclass('dg-checked');

			if (val === '-1') {
				if (checked) {
					opt.checked = {};
					for (var i = 0; i < opt.rows.length; i++)
						opt.checked[opt.rows[i].ROW] = 1;
				} else
					opt.checked = {};
				self.scrolling();
			} else if (checked)
				opt.checked[val] = 1;
			else
				delete opt.checked[val];

			self.fn_in_checked();
		});

		self.event('click', '.dg-columns-checkbox', function() {
			$(this).tclass('dg-columns-checkbox-checked');
		});

		self.event('click', 'button', function(e) {
			switch (this.name) {
				case 'columns-apply':
					self.applycolumns(true);
					break;
				case 'page-first':
					forcescroll = opt.scroll = 'y';
					self.get().page = 1;
					self.operation('page');
					break;
				case 'page-last':
					forcescroll = opt.scroll = 'y';
					var tmp = self.get();
					tmp.page = tmp.pages;
					self.operation('page');
					break;
				case 'page-prev':
					forcescroll = opt.scroll = 'y';
					self.get().page -= 1;
					self.operation('page');
					break;
				case 'page-next':
					forcescroll = opt.scroll = 'y';
					self.get().page += 1;
					self.operation('page');
					break;
				default:
					var el = $(this);
					var index = +el.closest('.dg-row,.dg-controls').attrd('index');
					var row = opt.rows[index];
					config.button && self.SEEX(config.button, this.name, row, el, e);
					break;
			}
		});

		self.scrollbarX.area.on('scroll', function() {
			!ishidedir && hidedir();
			isecolumns && self.applycolumns();
		});

		// config.exec && self.operation('init');
	};

	self.operation = function(type) {

		var value = self.get();

		if (value == null)
			value = {};

		if (type === 'filter' || type === 'init')
			value.page = 1;

		var keys = Object.keys(opt.filter);
		self.SEEX(config.exec, type, keys.length ? opt.filter : null, opt.sort && opt.sort.sort ? [(opt.sort.name + '_' + (opt.sort.sort === 1 ? 'asc' : 'desc'))] : null, value.page, self);

		switch (type) {
			case 'sort':
				self.redrawsorting();
				break;
		}
	};

	function align(type) {
		return type === 1 ? 'center' : type === 2 ? 'right' : type;
	}

	self.clear = function() {
		for (var i = 0; i < opt.rows.length; i++)
			opt.rows[i].CHANGES = undefined;
		self.renderrows(opt.rows, true);
		opt.cluster && opt.cluster.update(opt.render);
		self.fn_in_changed();
	};

	self.editcolumn = function(rindex, cindex) {

		var col;
		var row;

		if (cindex == null) {
			if (rindex instanceof jQuery) {
				cindex = rindex.attr('class').match(/\d+/);
				if (cindex)
					cindex = +cindex[0];
				else
					return;
				col = rindex;
			}
		} else
			row = opt.cluster.el.find('.dg-row-' + (rindex + 1));

		if (!col)
			col = row.find('.dg-col-' + cindex);

		var index = cindex;
		if (index == null)
			return;

		if (!row)
			row = col.closest('.dg-row');

		var data = {};
		data.col = opt.cols[index];
		if (!data.col.editable)
			return;

		data.rowindex = +row.attrd('index');
		data.row = opt.rows[data.rowindex];
		data.colindex = index;
		data.value = data.row[data.col.name];
		data.elrow = row;
		data.elcol = col;

		var clone = col.clone();
		var cb = function(data) {

			if (data == null) {
				col.replaceWith(clone);
				return;
			}

			data.row[data.col.name] = data.value;

			if (opt.rows[data.rowindex] != data.row)
				opt.rows[data.rowindex] = data.row;

			if (!data.row.CHANGES)
				data.row.CHANGES = {};

			data.row.CHANGES[data.col.name] = true;
			opt.render[data.rowindex] = $(self.renderrow(data.rowindex, data.row))[0];
			data.elrow.replaceWith(opt.render[data.rowindex]);
			self.fn_in_changed();

		};

		if (config.change)
			self.EXEC(config.change, data, cb, self);
		else
			self.datagrid_edit(data, cb);
	};

	self.applyfilter = function(obj, add) {


		if (!ready) {
			setTimeout(self.applyfilter, 100, obj, add);
			return;
		}

		if (!add)
			opt.filter = {};

		var keys = Object.keys(obj);

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var col = opt.cols.findItem('name', key);
			if (col.options) {
				var items = col.options instanceof Array ? col.options : GET(col.options);
				if (items instanceof Array) {
					var item = items.findItem(col.ovalue, obj[key]);
					if (item) {
						var el = header.find('.dg-hcol[data-index="{0}"] label'.format(col.index));
						if (el.length)
							self.applyfilterdirectory(el, col, item);
					}
				}
			}
		}

		header.find('input').each(function() {
			var t = this;
			var el = $(t);
			var val = obj[el.attrd('name')];
			if (val !== undefined)
				el.val(val == null ? '' : val);
		}).trigger('change');

	};

	self.rebind = function(code, prerender) {

		if (code.length < 30 && code.indexOf(' ') === -1) {
			schemas.$current = code;
			schemas[code] && self.rebind(schemas[code]);
			return;
		}

		opt.declaration = code;

		var type = typeof(code);
		if (type === 'string') {
			code = code.trim();
			self.gridid = 'dg' + HASH(code);
		} else
			self.gridid = 'dg' + HASH(JSON.stringify(code));

		var cache = config.remember ? W.PREF ? W.PREF.get(self.gridid) : CACHE(self.gridid) : null;
		var cols = type === 'string' ? new Function('return ' + code)() : CLONE(code);
		var tmp;

		opt.rowclasstemplate = null;
		opt.search = false;

		for (var i = 0; i < cols.length; i++) {
			var col = cols[i];

			if (typeof(col) === 'string') {
				opt.rowclasstemplate = Tangular.compile(col);
				cols.splice(i, 1);
				i--;
				continue;
			}

			if (col.type === 'controls' || col.type === 'buttons') {
				opt.controls = col.template ? Tangular.compile(col.template) : null;
				cols.splice(i, 1);
				i--;
				continue;
			}

			col.id = GUID(5);
			col.realindex = i;

			if (!col.name)
				col.name = col.id;

			if (col.listcolumn == null)
				col.listcolumn = true;

			if (col.hidden) {
				col.$hidden = FN(col.hidden)(col) === true;
				col.hidden = true;
			}

			if (col.hide) {
				col.hidden = col.hide === true;
				delete col.hide;
			}

			if (col.options) {
				!col.otext && (col.otext = 'text');
				!col.ovalue && (col.ovalue = 'value');
			}

			// SORT?
			if (col.sort != null)
				col.sorting = col.sort;

			if (cache) {
				var c = cache[i];
				if (c) {
					col.index = c.index;
					col.width = c.width;
					col.hidden = c.hidden;
				}
			}

			if (col.index == null)
				col.index = i;

			if (col.sorting == null)
				col.sorting = config.sorting;

			if (col.alignfilter != null)
				col.alignfilter = ' ' + align(col.alignfilter);

			if (col.alignheader != null)
				col.alignheader = ' ' + align(col.alignheader);

			col.sort = 0;

			if (col.search) {
				opt.search = true;
				col.search = col.search === true ? Tangular.compile(col.template) : Tangular.compile(col.search);
			}

			if (!col.align) {
				switch (col.type) {
					case 'date':
						col.align = 1;
						break;
					case 'number':
						col.align = 2;
						break;
					case 'boolean':
						col.align = 1;
						break;
				}
			}

			if (col.align && col.align !== 'left') {
				col.align = align(col.align);
				col.align = ' ' + col.align;
				if (!col.alignfilter)
					col.alignfilter = ' center';
				if (!col.alignheader)
					col.alignheader = ' center';
			}

			var cls = col.class ? (' ' + col.class) : '';

			if (col.editable) {
				cls += ' dg-editable';
				if (col.required)
					cls += ' dg-required';
			}

			if (config.autoformat) {
				switch (col.type) {
					case 'number':
						if (col.monospace == null)
							col.monospace = true;
						break;
				}
			}

			var isbool = col.type && col.type.substring(0, 4) === 'bool';
			var TC = Tangular.compile;

			if (col.template) {
				col.templatecustom = true;
				col.template = TC((col.template.indexOf('<button') === -1 ? ('<div class="dg-value' + (col.monospace ? ' dg-monospace' : '') + cls + '">{0}</div>') : '{0}').format(col.template));
			} else
				col.template = TC(('<div class="' + (isbool ? 'dg-bool' : ('dg-value' + (col.monospace ? ' dg-monospace' : ''))) + cls + '"' + (config.allowtitles ? ' title="{{ {0} }}"' : '') + '>{{ {0} }}</div>').format(col.name + (col.currency ? ' | currency(\'{0}\')'.format(col.currency) : col.format != null ? ' | format({0})'.format(col.format && typeof(col.format) === 'string' ? ('\'' + col.format + '\'') : col.format) : '') + (col.type && config.autoformat ? ' | ui_datagrid_autoformat(\'{0}\')'.format(col.type) : '') + (col.empty ? ' | def({0})'.format(col.empty === true || col.empty == '1' ? '' : ('\'' + col.empty + '\'')) : '') + (isbool ? ' | ui_datagrid_checkbox' : '') + (col.colorize ? (' | ui_datagrid_colorize(' + (col.currency || col.format ? 0 : 1) + ')') : '')));

			if (col.header)
				col.header = TC(col.header);
			else
				col.header = TC('{{ text | raw }}');

			if (!col.text)
				col.text = col.name;

			if (col.text.substring(0, 1) === '.')
				col.text = '<i class="{0}"></i>'.format(col.text.substring(1));

			if (col.filter !== false && !col.filter)
				col.filter = config.filterlabel;

			if (col.filtervalue != null) {
				tmp = col.filtervalue;
				if (typeof(tmp) === 'function')
					tmp = tmp(col);
				opt.filter[col.name] = opt.filtervalues[col.id] = tmp;
			}
		}

		cols.quicksort('index');
		opt.cols = cols;
		self.rebindcss();
		prerender && self.rendercols();
		controls.hide();

		// self.scrollbar.scroll(0, 0);
	};

	self.rebindcss = function() {

		var cols = opt.cols;
		var css = [];
		var indexes = {};

		opt.width = (config.numbering !== false ? 40 : 0) + (config.checkbox ? 40 : 0) + 30;

		for (var i = 0; i < cols.length; i++) {
			var col = cols[i];

			if (!col.width)
				col.width = config.colwidth;

			css.push('.dg-{2} .dg-col-{0}{width:{1}px}'.format(i, col.width, self.IDCSS));

			if (!col.hidden) {
				opt.width += col.width;
				indexes[i] = opt.width;
			}
		}

		CSS(css, self.ID);

		var w = self.width();
		if (w > opt.width)
			opt.width = w - 2;

		if (sheader) {
			css = { width: opt.width };
			header.css(css);
			// vbody.css(css);
		}

		header && header.find('.dg-resize').each(function() {
			var el = $(this);
			el.css('left', indexes[el.attrd('index')] - 39);
		});
	};

	self.cols = function(callback) {
		callback(opt.cols);
		opt.cols.quicksort('index');
		self.rebindcss();
		self.rendercols();
		opt.rows && self.renderrows(opt.rows);
		self.save();
		opt.cluster && opt.cluster.update(opt.render);
		self.resize();
	};

	self.rendercols = function() {

		var Trow = '<div class="dg-hrow dg-row-{0}">{1}</div>';
		var column = config.numbering !== false ? Theadercol({ index: -1, label: config.numbering, filter: false, name: '$', sorting: false }) : '';
		var resize = [];

		opt.width = (config.numbering !== false ? 40 : 0) + (config.checkbox ? 40 : 0) + 30;

		if (config.checkbox)
			column += Theadercol({ index: -1, label: '<div class="dg-checkbox dg-checkbox-main" data-value="-1"><i class="fa fa-check"></i></div>', filter: false, name: '$', sorting: false });

		for (var i = 0; i < opt.cols.length; i++) {
			var col = opt.cols[i];
			if (!col.hidden) {
				var filteritems = col.options ? col.options instanceof Array ? col.options : GET(col.options) : null;
				var filtervalue = opt.filtervalues[col.id];
				var obj = { index: i, ts: NOW.getTime(), label: col.header(col), filter: col.filter, reorder: config.reorder, sorting: col.sorting, name: col.name, alignfilter: col.alignfilter, alignheader: col.alignheader, filterval: filtervalue == null ? null : filteritems ? filteritems.findValue(col.ovalue, filtervalue, col.otext, '???') : filtervalue, labeltitle: col.title || col.text, options: filteritems };
				opt.width += col.width;
				config.resize && resize.push('<span class="dg-resize" style="left:{0}px" data-index="{1}"></span>'.format(opt.width - 39, i));
				column += Theadercol(obj);
			}
		}

		column += '<div class="dg-hcol"></div>';
		header[0].innerHTML = resize.join('') + Trow.format(0, column);

		var w = self.width();
		if (w > opt.width)
			opt.width = w;

		self.redrawsorting();
	};

	self.redraw = function(update) {
		var x = self.scrollbarX.scrollLeft();
		var y = self.scrollbarY ? self.scrollbarY.scrollTop() : 0;
		isredraw = update ? 2 : 1;
		self.refreshfilter();
		isredraw = 0;
		self.scrollbarX.scrollLeft(x);
		self.scrollbarY && self.scrollbarY.scrollTop(y);
	};

	self.redrawrow = function(oldrow, newrow) {
		var index = opt.rows.indexOf(oldrow);
		if (index !== -1) {

			controls.cache = {};

			// Replaces old row with a new
			if (newrow) {
				if (self.selected === oldrow)
					self.selected = newrow;
				oldrow = opt.rows[index] = newrow;
			}

			var el = vbody.find('.dg-row[data-index="{0}"]'.format(index));
			if (el.length) {
				opt.render[index] = $(self.renderrow(index, oldrow))[0];
				el[0].parentNode.replaceChild(opt.render[index], el[0]);
			}
		}
	};

	self.appendrow = function(row, scroll, prepend) {

		var index = prepend ? 0 : (opt.rows.push(row) - 1);
		var model = self.get();

		controls.cache = {};

		if (model == null) {
			// bad
			return;
		} else {
			var arr = model.items ? model.items : model;
			if (prepend) {
				arr.unshift(row);
			} else if (model.items)
				arr.push(row);
			else
				arr.push(row);
		}

		if (prepend) {
			var tmp;
			// modifies all indexes
			for (var i = 0; i < opt.render.length; i++) {
				var node = opt.render[i];
				if (typeof(node) === 'string')
					node = opt.render[i] = $(node)[0];
				var el = $(node);
				var tmpindex = i + 1;
				tmp = el.rclass2('dg-row-').aclass('dg-row-' + tmpindex).attrd('index', tmpindex);
				tmp.find('.dg-number').html(tmpindex + 1);
				tmp.find('.dg-checkbox-main').attrd('value', tmpindex);
				if (opt.rows[i])
					opt.rows[i].ROW = tmpindex;
			}
			row.ROW = index;
			tmp = {};
			var keys = Object.keys(opt.checked);
			for (var i = 0; i < keys.length; i++)
				tmp[(+keys[i]) + 1] = 1;
			opt.checked = tmp;
			opt.render.unshift(null);
		}

		opt.render[index] = $(self.renderrow(index, row))[0];
		opt.cluster && opt.cluster.update(opt.render, !opt.scroll || opt.scroll === '-');
		if (scroll) {
			var el = opt.cluster.el[0];
			el.scrollTop = el.scrollHeight;
		}
		self.scrolling();
	};

	self.renderrow = function(index, row, plus) {

		if (plus === undefined && config.exec) {
			// pagination
			var val = self.get();
			plus = (val.page - 1) * val.limit;
		}

		var Trow = '<div><div class="dg-row dg-row-{0}{3}{4}" data-index="{2}">{1}</div></div>';
		var Tcol = '<div class="dg-col dg-col-{0}{2}{3}">{1}</div>';
		var column = '';

		if (config.numbering !== false)
			column += Tcol.format(-1, '<div class="dg-number">{0}</div>'.format(index + 1 + (plus || 0)));

		if (config.checkbox)
			column += Tcol.format(-1, '<div class="dg-checkbox-main dg-checkbox{1}" data-value="{0}"><i class="fa fa-check"></i></div>'.format(row.ROW, opt.checked[row.ROW] ? ' dg-checked' : ''));

		for (var j = 0; j < opt.cols.length; j++) {
			var col = opt.cols[j];
			if (!col.hidden)
				column += Tcol.format(j, col.template(row), col.align, row.CHANGES && row.CHANGES[col.name] ? ' dg-col-changed' : '');
		}

		column += '<div class="dg-col">&nbsp;</div>';
		var rowcustomclass = opt.rowclasstemplate ? opt.rowclasstemplate(row) : '';
		return Trow.format(index + 1, column, index, self.selected === row ? ' dg-selected' : '', (row.CHANGES ? ' dg-row-changed' : '') + (rowcustomclass || ''));
	};

	self.renderrows = function(rows, noscroll) {

		opt.rows = rows;
		controls.cache = {};

		var output = [];
		var plus = 0;

		if (config.exec) {
			// pagination
			var val = self.get();
			plus = (val.page - 1) * val.limit;
		}

		var is = false;

		for (var i = 0, length = rows.length; i < length; i++) {
			var row = rows[i];
			if (!is && self.selected) {
				if (self.selected === row) {
					is = true;
				} else if (config.clickid && self.selected[config.clickid] === row[config.clickid]) {
					self.selected = row;
					is = true;
				}
			}

			output.push(self.renderrow(i, rows[i], plus));
		}

		var min = ((((opt.height || config.minheight) - 120) / config.rowheight) >> 0) + 1;
		var is = output.length < min;
		if (is) {
			for (var i = output.length; i < min + 1; i++)
				output.push('<div class="dg-row-empty">&nbsp;</div>');
		}

		self.tclass('dg-noscroll', is);

		if (noscroll) {
			self.scrollbarX.scrollLeft(0);
			self.scrollbarY && self.scrollbarY.scrollTop(0);
		}

		opt.render = output;
		self.onrenderrows && self.onrenderrows(opt);
	};

	self.exportrows = function(page_from, pages_count, callback, reset_page_to, sleep) {

		var arr = [];
		var source = self.get();

		if (reset_page_to === true)
			reset_page_to = source.page;

		if (page_from === true)
			reset_page_to = source.page;

		pages_count = page_from + pages_count;

		if (pages_count > source.pages)
			pages_count = source.pages;

		for (var i = page_from; i < pages_count; i++)
			arr.push(i);

		!arr.length && arr.push(page_from);

		var index = 0;
		var rows = [];

		arr.wait(function(page, next) {
			opt.scroll = (index++) === 0 ? 'xy' : '';
			self.get().page = page;
			self.operation('page');
			self.onrenderrows = function(opt) {
				rows.push.apply(rows, opt.rows);
				setTimeout(next, sleep || 100);
			};
		}, function() {
			self.onrenderrows = null;
			callback(rows, opt);
			if (reset_page_to > 0) {
				self.get().page = reset_page_to;
				self.operation('page');
			}
		});
	};

	self.reordercolumn = function(index, position) {

		var col = opt.cols[index];
		if (!col)
			return;

		var old = col.index;

		opt.cols[index].index = position + (old < position ? 0.2 : -0.2);
		opt.cols.quicksort('index');

		for (var i = 0; i < opt.cols.length; i++) {
			col = opt.cols[i];
			col.index = i;
		}

		opt.cols.quicksort('index');

		self.rebindcss();
		self.rendercols();
		self.renderrows(opt.rows);
		opt.sort && opt.sort.sort && self.redrawsorting();
		opt.cluster && opt.cluster.update(opt.render, true);
		self.scrolling();

		controls.hide();
		config.remember && self.save();
	};

	self.resizecolumn = function(index, size) {
		opt.cols[index].width = size;
		self.rebindcss();
		config.remember && self.save();
		self.resize();
	};

	self.save = function() {

		var cache = {};

		for (var i = 0; i < opt.cols.length; i++) {
			var col = opt.cols[i];
			col.index = i;
			cache[col.realindex] = { index: col.index, width: col.width, hidden: col.hidden };
		}

		if (W.PREF)
			W.PREF.set(self.gridid, cache, '1 month');
		else
			CACHE(self.gridid, cache, '1 month');
	};

	self.rows = function() {
		return opt.rows.slice(0);
	};

	var resizecache = {};

	self.resize = function() {
		setTimeout2(self.ID + 'resize', self.resizeforce, 100);
	};

	self.resizeforce = function() {

		if (!opt.cols || HIDDEN(self.dom))
			return;

		var el;
		var footerh = opt.footer = footer.length ? footer.height() : 0;

		if (typeof(config.height) === 'string' && config.height.substring(0, 6) === 'parent') {

			el = self.element.parent();

			var count = +config.height.substring(6);
			if (count) {
				for (var i = 0; i < count; i++)
					el = el.parent();
			}

			opt.height = (el.height() - config.margin);

		} else {
			switch (config.height) {
				case 'auto':
					var wh = config.parent ? self.parent(config.parent).height() : WH;
					el = self.element;
					opt.height = (wh - (el.offset().top + config.margin));
					break;
				case 'window':
					opt.height = WH - config.margin;
					break;
				case 'fluid':
					opt.height = (opt.rows ? opt.rows.length : 0) * config.rowheight;
					break;
				default:

					if (config.height > 0) {
						opt.height = config.height;
					} else {
						el = self.element.closest(config.height);
						opt.height = ((el.length ? el.height() : 200) - config.margin);
					}
					break;
			}
		}

		var mr = (vbody.parent().css('margin-right') || '').parseInt();
		var h = opt.height - footerh;
		var sh = SCROLLBARWIDTH();
		controls.hide();

		if (config.height === 'fluid') {
			var mh = config.minheight;
			if (h < mh)
				h = mh;
		} else if (config.height === 'auto') {
			var mh = config.minheight;
			if (h < mh)
				h = mh;
		}

		var ismobile = isMOBILE && isTOUCH;

		if (resizecache.mobile !== ismobile && !config.noborder) {
			resizecache.mobile = ismobile;
			self.tclass('dg-mobile', ismobile);
		}

		if (resizecache.h !== h) {
			resizecache.h = h;
			sheader.css('height', h);
		}

		var tmpsh = h - (sh ? (sh + self.scrollbarX.thinknessX - 2) : (footerh - 2));
		resizecache.tmpsh = h;
		sbody.css('height', tmpsh + self.scrollbarX.marginY + (config.exec && self.scrollbarX.size.empty ? footerh : 0));

		var w;

		if (config.fullwidth_xs && WIDTH() === 'xs' && isMOBILE) {
			var isfrm = false;
			try {
				isfrm = W.self !== W.top;
			} catch (e) {
				isfrm = true;
			}
			if (isfrm) {
				w = screen.width - (self.element.offset().left * 2);
				if (resizecache.wmd !== w) {
					resizecache.wmd = w;
					self.css('width', w);
				}
			}
		}

		if (w == null)
			w = self.width();

		var emptyspace = 50 - mr;
		if (emptyspace < 50)
			emptyspace = 50;

		var width = (config.numbering !== false ? 40 : 0) + (config.checkbox ? 40 : 0) + emptyspace;

		for (var i = 0; i < opt.cols.length; i++) {
			var col = opt.cols[i];
			if (!col.hidden)
				width += col.width + 1;
		}

		if (w > width)
			width = w - 2;

		if (resizecache.hc !== h) {
			resizecache.hc = h;
			container.css('height', h);
		}

		if (resizecache.width !== width) {
			resizecache.width = width;
			header.css('width', width);
			vbody.css('width', width);
			sbody.css('width', width);
			opt.width2 = w;
		}

		opt.height = h + footerh;
		self.scrollbarX.resize();
		self.scrollbarY && self.scrollbarY.resize();

		ready = true;
		// header.parent().css('width', self.scrollbar.area.width());
	};

	self.refreshfilter = function(useraction) {

		// Get data
		var obj = self.get() || EMPTYARRAY;
		var items = (obj instanceof Array ? obj : obj.items) || EMPTYARRAY;
		var output = [];

		if (isredraw) {
			if (isredraw === 2) {
				self.fn_in_checked();
				self.fn_in_changed();
			}
		} else {
			opt.checked = {};
			config.checkbox && header.find('.dg-checkbox-main').rclass('dg-checked');
			self.fn_in_checked(EMPTYARRAY);
		}

		for (var i = 0, length = items.length; i < length; i++) {
			var item = items[i];

			item.ROW = i;

			if (!config.exec) {
				if (opt.filter && !self.filter(item))
					continue;
				if (opt.search) {
					for (var j = 0; j < opt.cols.length; j++) {
						var col = opt.cols[j];
						if (col.search)
							item['$' + col.name] = col.search(item);
					}
				}
			}

			output.push(item);
		}

		if (!isredraw) {

			if (opt.scroll) {

				if (self.scrollbarY && (/y/).test(opt.scroll))
					self.scrollbarY.scrollTop(0);

				if ((/x/).test(opt.scroll)) {
					if (useraction)	{
						var sl = self.scrollbarX.scrollLeft();
						self.scrollbarX.scrollLeft(sl ? sl - 1 : 0);
					} else
						self.scrollbarX.scrollLeft(0);
				}

				opt.scroll = '';
			}

			if (opt.sort != null) {
				if (!config.exec)
					opt.sort.sort && output.quicksort(opt.sort.name, opt.sort.sort === 1);
				self.redrawsorting();
			}
		}

		self.resize();
		self.renderrows(output, isredraw);

		setTimeout(self.resize, 100);
		opt.cluster && opt.cluster.update(opt.render, !opt.scroll || opt.scroll === '-');
		self.scrolling();

		if (isredraw) {
			if (isredraw === 2) {
				// re-update all items
				self.select(self.selected || null);
			}
		} else {
			var sel = self.selected;
			if (config.autoselect && output && output.length) {
				setTimeout(function() {
					var index = sel ? output.indexOf(sel) : 0;
					if (index === -1)
						index = 0;
					self.select(output[index]);
				}, 1);
			} else {
				var index = sel ? output.indexOf(sel) : -1;
				self.select(index === -1 ? null : output[index]);
			}
		}
	};

	self.redrawsorting = function() {
		var arr = self.find('.dg-sorting');
		for(var i = 0; i < arr.length; i++) {
			var el = $(arr[i]);
			var col = opt.cols[+el.attrd('index')];
			if (col) {
				var fa = el.find('.dg-sort').rclass2('fa-');
				switch (col.sort) {
					case 1:
						fa.aclass('fa-arrow-up');
						break;
					case 2:
						fa.aclass('fa-arrow-down');
						break;
					default:
						fa.aclass('fa-sort');
						break;
				}
			}
		}
		controls.hide();
	};

	self.resetcolumns = function() {

		if (W.PREF)
			W.PREF.set(self.gridid);
		else
			CACHE(self.gridid, null, '-1 day');

		self.rebind(opt.declaration);
		self.cols(NOOP);
		ecolumns.aclass('hidden');
		isecolumns = false;
		controls.hide();
	};

	self.resetfilter = function() {
		opt.filter = {};
		opt.filtercache = {};
		opt.filtercl = {};
		opt.filtervalues = {};
		opt.cols && self.rendercols();
		if (config.exec)
			self.operation('refresh');
		else
			self.refresh();
		controls.hide();
	};

	var pagecache = { pages: -1, count: -1 };

	self.redrawpagination = function() {

		if (!config.exec)
			return;

		var value = self.get();

		if (!value.page)
			value.page = 1;

		if (value.pages == null)
			value.pages = 0;

		if (value.count == null)
			value.count = 0;

		var is = false;

		if (value.page === 1 || (value.pages != null && value.count != null)) {
			pagecache.pages = value.pages;
			pagecache.count = value.count;
			is = true;
		}

		footer.find('button').each(function() {

			var el = $(this);
			var dis = true;

			switch (this.name) {
				case 'page-next':
					dis = value.page >= pagecache.pages;
					break;
				case 'page-prev':
					dis = value.page === 1;
					break;
				case 'page-last':
					dis = !value.page || value.page >= pagecache.pages;
					break;
				case 'page-first':
					dis = value.page === 1;
					break;
			}

			el.prop('disabled', dis);
		});

		footer.find('input')[0].value = value.page;

		if (is) {
			var num = pagecache.pages || 0;
			footer.find('.dg-pagination-pages')[0].innerHTML = num.pluralize.apply(num, config.pluralizepages);
			num = pagecache.count || 0;
			footer.find('.dg-pagination-items')[0].innerHTML = num.pluralize.apply(num, config.pluralizeitems);
		}

		footer.rclass('hidden');
	};

	self.setter = function(value, path, type) {

		if (!ready) {
			setTimeout(self.setter, 100, value, path, type);
			return;
		}

		controls.hide();

		if (config.exec && (value == null || value.items == null)) {
			self.operation('refresh');
			if (value && value.items == null)
				value.items = [];
			else
				return;
		}

		if (value && value.schema && schemas.$current !== value.schema) {
			schemas.$current = value.schema;
			self.selected = null;
			self.rebind(schemas[value.schema], true);
			setTimeout(function() {
				self.setter(value, path, type);
			}, 100);
			return;
		}

		if (!opt.cols)
			return;

		opt.checked = {};

		if (forcescroll) {
			opt.scroll = forcescroll;
			forcescroll = '';
		} else
			opt.scroll = type !== 'noscroll' ? 'xy' : '';

		self.applycolumns();
		self.refreshfilter();
		self.redrawsorting();
		self.redrawpagination();
		self.fn_in_changed();
		!config.exec && self.rendercols();
		setTimeout2(self.ID + 'resize', self.resize, 100);

		if (opt.cluster)
			return;

		config.exec && self.rendercols();
		opt.cluster = new Cluster(vbody);
		opt.cluster.grid = self;
		opt.cluster.scroll = self.scrolling;
		opt.render && opt.cluster.update(opt.render);
		self.aclass('dg-visible');
	};

	self.scrolling = function() {
		config.checkbox && setTimeout2(self.ID, function() {
			vbody.find('.dg-checkbox-main').each(function() {
				$(this).tclass('dg-checked', opt.checked[this.getAttribute('data-value')] == 1);
			});
		}, 80, 10);
	};

	var REG_STRING = /\/\|\\|,/;
	var REG_DATE1 = /\s-\s/;
	var REG_DATE2 = /\/|\||\\|,/;
	var REG_SPACE = /\s/g;

	self.filter = function(row) {
		var keys = Object.keys(opt.filter);
		for (var i = 0; i < keys.length; i++) {

			var column = keys[i];
			var filter = opt.filter[column];
			var val2 = opt.filtercache[column];
			var val = row['$' + column] || row[column];
			var type = typeof(val);

			if (val instanceof Array) {
				val = val.join(' ');
				type = 'string';
			} else if (val && type === 'object' && !(val instanceof Date)) {
				val = JSON.stringify(val);
				type = 'string';
			}

			if (type === 'number') {

				if (val2 == null)
					val2 = opt.filtercache[column] = self.parseNumber(filter);

				if (val2.length === 1 && val !== val2[0])
					return false;

				if (val < val2[0] || val > val2[1])
					return false;

			} else if (type === 'string') {

				var is = false;

				if (opt.filtercl[column] != null) {
					is = opt.filtercl[column] == val;
					if (!is)
						return false;
				}

				if (val2 == null) {
					val2 = opt.filtercache[column] = filter.split(REG_STRING).trim();
					for (var j = 0; j < val2.length; j++)
						val2[j] = val2[j].toSearch();
				}

				var s = val.toSearch();

				for (var j = 0; j < val2.length; j++) {
					if (s.indexOf(val2[j]) !== -1) {
						is = true;
						break;
					}
				}

				if (!is)
					return false;

			} else if (type === 'boolean') {
				if (val2 == null)
					val2 = opt.filtercache[column] = typeof(filter) === 'string' ? config.boolean.indexOf(filter.replace(REG_SPACE, '')) !== -1 : filter;
				if (val2 !== val)
					return false;
			} else if (val instanceof Date) {

				val.setHours(0);
				val.setMinutes(0);

				if (val2 == null) {

					val2 = filter.trim().replace(REG_DATE1, '/').split(REG_DATE2).trim();
					var arr = opt.filtercache[column] = [];

					for (var j = 0; j < val2.length; j++) {
						var dt = val2[j].trim();
						var a = self.parseDate(dt, j === 1);
						if (a instanceof Array) {
							if (val2.length === 2) {
								arr.push(j ? a[1] : a[0]);
							} else {
								arr.push(a[0]);
								if (j === val2.length - 1) {
									arr.push(a[1]);
									break;
								}
							}
						} else
							arr.push(a);
					}

					if (val2.length === 2 && arr.length === 2) {
						arr[1].setHours(23);
						arr[1].setMinutes(59);
						arr[1].setSeconds(59);
					}

					val2 = arr;
				}

				if (val2.length === 1) {
					if (val2[0].YYYYMM)
						return val.format('yyyyMM') === val2[0].format('yyyyMM');
					if (val.format('yyyyMMdd') !== val2[0].format('yyyyMMdd'))
						return false;
				}

				if (val < val2[0] || val > val2[1])
					return false;

			} else
				return false;
		}

		return true;
	};

	self.checked = function() {
		var arr = Object.keys(opt.checked);
		var output = [];
		var model = self.get() || EMPTYARRAY;
		var rows = model instanceof Array ? model : model.items;
		for (var i = 0; i < arr.length; i++) {
			var index = +arr[i];
			output.push(rows[index]);
		}
		return output;
	};

	self.readfilter = function() {
		return opt.filter;
	};

	self.changed = function() {
		var output = [];
		var model = self.get() || EMPTYARRAY;
		var rows = model instanceof Array ? model : model.items;
		for (var i = 0; i < rows.length; i++)
			rows[i].CHANGES && output.push(rows[i]);
		return output;
	};

	self.parseDate = function(val, second) {

		var index = val.indexOf('.');
		var m, y, d, a, special, tmp;

		if (index === -1) {
			if ((/[a-z]+/).test(val)) {
				var dt;
				try {
					dt = NOW.add(val);
				} catch (e) {
					return [0, 0];
				}
				return dt > NOW ? [NOW, dt] : [dt, NOW];
			}
			if (val.length === 4)
				return [new Date(+val, 0, 1), new Date(+val + 1, 0, 1)];
		} else if (val.indexOf('.', index + 1) === -1) {
			a = val.split('.');
			if (a[1].length === 4) {
				y = +a[1];
				m = +a[0] - 1;
				d = second ? new Date(y, m, 0).getDate() : 1;
				special = true;
			} else {
				y = NOW.getFullYear();
				m = +a[1] - 1;
				d = +a[0];
			}

			tmp = new Date(y, m, d);
			if (special)
				tmp.YYYYMM = true;
			return tmp;
		}
		index = val.indexOf('-');
		if (index !== -1 && val.indexOf('-', index + 1) === -1) {
			a = val.split('-');
			if (a[0].length === 4) {
				y = +a[0];
				m = +a[1] - 1;
				d = second ? new Date(y, m, 0).getDate() : 1;
				special = true;
			} else {
				y = NOW.getFullYear();
				m = +a[0] - 1;
				d = +a[1];
			}

			tmp = new Date(y, m, d);

			if (special)
				tmp.YYYYMM = true;

			return tmp;
		}

		return val.parseDate();
	};

	var REG_NUM1 = /\s-\s/;
	var REG_COMMA = /,/g;
	var REG_NUM2 = /\/|\|\s-\s|\\/;

	self.parseNumber = function(val) {
		var arr = [];
		var num = val.replace(REG_NUM1, '/').replace(REG_SPACE, '').replace(REG_COMMA, '.').split(REG_NUM2).trim();
		for (var i = 0, length = num.length; i < length; i++) {
			var n = num[i];
			arr.push(+n);
		}
		return arr;
	};

	self.datagrid_cancel = function(meta, force) {
		var current = self.editable;
		if (current && current.is) {
			current.is = false;
			force && current.el.replaceWith(current.backup);
			current.input.off();
			$(W).off('keydown', current.fn).off('click', current.fn);
		}
	};

	self.datagrid_edit = function(meta, next) {

		if (!meta || !meta.col.editable)
			return;

		if (!self.editable)
			self.editable = {};

		var el = meta.elcol;
		var current = self.editable;
		current.is && self.datagrid_cancel(meta, true);
		current.is = true;

		current.backup = el.find('.dg-editable').aclass('dg-editable').clone();
		el = el.find('.dg-editable');

		if (!meta.col.type) {
			if (meta.value instanceof Date)
				meta.col.type = 'date';
			else
				meta.col.type = typeof(meta.value);
		}

		if (meta.col.options) {
			current.el = el;
			var opt = {};
			opt.element = el;
			opt.items = meta.col.options;
			opt.key = meta.col.otext;
			opt.placeholder = meta.col.dirsearch ? meta.col.dirsearch : '';
			if (meta.col.dirsearch === false)
				opt.search = false;
			opt.callback = function(item) {
				current.is = false;
				meta.value = item[meta.col.ovalue];
				next(meta);
				self.datagrid_cancel(meta);
			};
			SETTER('directory', 'show', opt);
			return;
		}

		var align = meta.col.align;
		el.rclass('dg-value').html(meta.col.type.substring(0, 4) === 'bool' ? '<div{1}><div class="dg-checkbox{0}" data-custom="2"><i class="fa fa-check"></i></div></div>'.format(meta.value ? ' dg-checked' : '', align ? (' class="' + align.trim() + '"') : '') : '<input type="{0}" maxlength="{1}"{2} />'.format(meta.col.ispassword ? 'password' : 'text', meta.col.maxlength || 100, align ? (' class="' + align.trim() + '"') : ''));
		current.el = el;

		var input = meta.elcol.find('input');
		input.val(meta.value instanceof Date ? meta.value.format(meta.col.format) : meta.value);
		input.focus();
		current.input = input;

		if (meta.col.type === 'date') {
			// DATE
			var opt = {};
			opt.element = el;
			opt.value = meta.value;
			opt.callback = function(date) {
				current.is = false;
				meta.value = date;
				next(meta);
				self.datagrid_cancel(meta);
			};
			SETTER('datepicker', 'show', opt);
		}

		current.fn = function(e) {

			if (!current.is)
				return;

			if (e.type === 'click') {
				if (e.target.tagName === 'INPUT')
					return;
				e.preventDefault();
				e.keyCode = 13;
				if (meta.col.type === 'date') {
					e.type = 'keydown';
					setTimeout(current.fn, 800, e);
					return;
				} else if (meta.col.type.substring(0, 4) === 'bool') {
					var tmp = $(e.target);
					var is = tmp.hclass('dg-checkbox');
					if (!is) {
						tmp = tmp.closest('.dg-checkbox');
						is = tmp.length;
					}
					if (is) {
						meta.value = tmp.hclass('dg-checked');
						next(meta);
						self.datagrid_cancel(meta);
						return;
					}
				}
			}

			switch (e.keyCode) {
				case 13: // ENTER
				case 9: // TAB

					var val = input.val();
					if (val == meta.value) {
						next = null;
						self.datagrid_cancel(meta, true);
					} else {

						if (meta.col.type === 'number') {
							val = val.parseFloat();
							if (val == meta.value || (meta.min != null && meta.min > val) || (meta.max != null && meta.max < val)) {
								next = null;
								self.datagrid_cancel(meta, true);
								return;
							}
						} else if (meta.col.type === 'date') {

							val = val.parseDate(meta.format ? meta.format.env() : undefined);

							if (!val || isNaN(val.getTime()))
								val = null;

							if (val && meta.value && val.getTime() === meta.value.getTime()) {
								next = null;
								self.datagrid_cancel(meta, true);
								return;
							}
						}

						if (meta.col.required && (val == null || val === '')) {
							// WRONG VALUE
							self.datagrid_cancel(meta, true);
							return;
						}

						meta.value = val;
						next(meta);
						self.datagrid_cancel(meta);
					}

					if (e.which === 9) {

						// tries to edit another field
						var elcol = meta.elcol;

						while (true) {
							elcol = elcol.next();
							if (!elcol.length)
								break;

							var eledit = elcol.find('.dg-editable');
							if (eledit.length) {
								setTimeout(function(meta, elcol) {
									self.editcolumn(meta.rowindex, +elcol.attr('class').match(/\d+/)[0]);
								}, 200, meta, elcol);
								break;
							}
						}
					}

					break;

				case 27: // ESC
					next = null;
					self.datagrid_cancel(meta, true);
					break;
			}
		};

		$(W).on('keydown', current.fn).on('click', current.fn);
	};
});

COMPONENT('datatable', 'height:parent;margin:0;pluralizeitems:# items,# item,# items,# items;pluralizepages:# pages,# page,# pages,# pages;unhighlight:0;colwidth:150;rowheight:24;clickid:id;minheight:300', function(self, config, cls) {

	var cls2 = '.' + cls;
	var container_rows;
	var container_cols;
	var container_pages;
	var template_col = Tangular.compile('<div data-name="{{ name }}" class="{0}-col{{ if sort }} {0}-sortable{{ fi }}{{ if alignheader }} {{ alignheader }}{{ fi }}" style="width:{{ width }}px">{{ if sort }}<i class="fa"></i>{{ fi }}<span>{{ text | raw }}</span></div>'.format(cls));
	var meta = {};
	var temp = {};

	self.init = function() {

		Thelpers.ui_datatable_checkbox = function(val) {
			return ('<div class="{0}-checkbox' + (val ? ' {0}-checkbox-checked' : '') + '"><i class="fa fa-check"></i></div>').format(cls);
		};

		var resize = function() {
			for (var i = 0; i < M.components.length; i++) {
				var com = M.components[i];
				if (com.name === 'datatable' && !HIDDEN(com.dom) && com.$ready && !com.$removed)
					com.resizeforce();
			}
		};

		W.DATATABLEMETA = false;
		W.DATATABLESHIFT = false;
		$(W).on('keydown', function(e) {
			W.DATATABLESHIFT = e.shiftKey;
			W.DATATABLEMETA = e.metaKey;
		}).on('keyup', function() {
			W.DATATABLESHIFT = false;
			W.DATATABLEMETA = false;
		}).on('resize', function() {
			setTimeout2(cls, resize, 500);
		});
	};

	self.make = function() {

		var scr = self.find('script');
		var html = scr.html();
		scr.remove();

		self.aclass(cls);
		self.append('<div class="{0}-cols-scroller"><div class="{0}-cols"></div></div><div class="{0}-rows-scroller"><div class="{0}-rows"></div></div><div class="{0}-pagination"><div class="{0}-info"></div><div class="{0}-pages"><button name="prev" disabled><i class="fa fa-chevron-left"></i></button><input value="1" type="text" maxlength="4" disabled /><button name="next" disabled><i class="fa fa-chevron-right"></i></button></div></div>'.format(cls));

		config.noborder && self.css('border', '0');

		container_cols = self.find(cls2 + '-cols');
		container_rows = self.find(cls2 + '-rows');
		container_pages = self.find(cls2 + '-pagination');

		var p = config.height;
		self.scrollbar = SCROLLBAR(container_rows.parent(), { onscroll: self.onscroll, visibleX: 1, visibleY: p === 'fluid' ? 0 : 1 });

		self.event('click', cls2 + '-sortable', function() {

			var el = $(this);
			var name = el.attrd('name');
			var isa = el.hclass('asc');
			var isd = el.hclass('desc');

			if (isa && !isd)
				name += '_desc';
			else if (!isa && !isd)
				name += '_asc';

			self.sort(name);
		});

		container_rows.on('click', cls2 + '-row', function() {

			if (meta.clickskip) {
				meta.clickskip = false;
				return;
			}

			var el = $(this);
			var index = +el.attrd('index');
			var row = meta.rows[index];

			if (meta.checked.length) {
				meta.checked = [];
				self.redrawchecked();
			}

			if (config.highlight) {
				if (config.unhighlight && meta.selected && meta.selected[0] === this) {
					meta.selected.rclass(cls + '-selected');
					config.click && EXEC(self.makepath(config.click), null, self);
					meta.selected = null;
				} else
					self.select(row);
			}
		});

		container_rows.on('contextmenu', function(e) {
			if (config.contextmenu) {
				e.preventDefault();
				EXEC(self.makepath(config.contextmenu), e, self);
			}
		});

		container_rows.on('mousedown', cls2 + '-row-col', function(e) {

			var now = Date.now();

			if (meta.click) {
				if (now - meta.click < 500)
					e.preventDefault();
			}

			meta.click = now;

			if (!config.checked)
				return;

			var elcol = $(this);
			var elrow = elcol.parent();

			if (elrow.hclass(cls + '-empty'))
				return;

			var oldindex = temp.index;

			temp.index = +elrow.attrd('index');

			if (W.DATATABLEMETA || W.DATATABLESHIFT)
				e.preventDefault();

			if (W.DATATABLESHIFT && oldindex !== -1) {

				var a = oldindex;
				var b = temp.index;
				if (a > b) {
					var tmp = a;
					a = b;
					b = tmp;
				}

				for (var i = a; i <= b; i++) {
					var row = meta.rows[i];
					if (meta.checked.indexOf(row) === -1)
						meta.checked.push(row);
				}
				self.redrawchecked();
				meta.clickskip = true;
				return;
			}

			if (W.DATATABLEMETA) {
				var row = meta.rows[temp.index];
				if (row && meta.checked.indexOf(row) === -1) {
					meta.checked.push(row);
					self.redrawchecked();
				}
				meta.clickskip = true;
			} else {
				temp.drag = true;
				temp.bindevents();
			}
		});

		temp.onmove = function(e) {

			e.preventDefault();

			var elrow = $(this);
			var index = +elrow.attrd('index');

			if (index === meta.currentindex)
				return;

			if (meta.selected) {
				meta.selected.rclass(cls + '-selected');
				meta.selected = null;
				config.click && EXEC(self.makepath(config.click), null, self);
			}

			meta.currentindex = index;
			meta.checked = [];

			var a = temp.index;
			var b = index;

			if (a > b) {
				var tmp = a;
				a = b;
				b = tmp;
			}

			for (var i = a; i <= b; i++) {
				var row = meta.rows[i];
				if (meta.checked.indexOf(row) === -1)
					meta.checked.push(row);
			}

			self.redrawchecked();
		};

		temp.bindevents = function() {
			container_rows.on('mouseleave', temp.unbindevents);
			container_rows.on('mouseup', temp.unbindevents);
			container_rows.on('mousemove', cls2 + '-row', temp.onmove);
		};

		temp.unbindevents = function() {

			meta.selected && meta.selected.rclass(cls + '-selected');
			config.click && EXEC(self.makepath(config.click), null, self);
			meta.selected = null;

			container_rows.off('mouseup', temp.unbindevents);
			container_rows.off('mouseleave', temp.unbindevents);
			container_rows.off('mousemove', cls2 + '-row', temp.onmove);
		};

		container_rows.on('dblclick', cls2 + '-row-col', function() {

			var el = $(this);
			var name = el.attrd('name');
			var col = meta.cols.findItem('name', name);
			var elrow = el.parent();

			if (elrow.hclass(cls + '-empty'))
				return;

			var index = +elrow.attrd('index');
			var row = meta.rows[index];

			if (!col.editable) {
				config.dblclick && SEEX(self.makepath(config.dblclick), row, self, elrow);
				return;
			}

			var opt = {};
			opt.index = index;
			opt.row = row;
			opt.col = col;
			opt.elcol = el;
			opt.elrow = elrow;
			opt.value = row[name];
			opt.next = function(value) {

				if (!row.CHANGES)
					row.CHANGES = {};

				row.CHANGES[name] = true;
				row[name] = value;

				var selected = opt.elrow.hclass(cls + '-selected');
				var el = self.redrawrow(index);
				if (el) {
					el.find(cls2 + '-row-col[data-name="{0}"]'.format(name)).aclass(cls + '-changed');
					if (meta.changed.indexOf(row) === -1) {
						meta.changed.push(row);
						if (selected)
							meta.selected = el.aclass(cls + '-selected');
						config.changed && EXEC(self.maketpath(config.changed), meta.changed);
					}
				}
			};

			config.editable && EXEC(self.makepath(config.editable), opt);
		});

		container_pages.on('click', 'button', function() {
			var page = 0;
			switch (this.name) {
				case 'prev':
					page = meta.page - 1;
					break;
				case 'next':
					page = meta.page + 1;
					break;
			}
			page && self.page(page);
		});

		container_pages.on('change', 'input', function() {
			var page = this.value.parseInt();

			if (page > meta.pages)
				page = meta.pages;

			if (page < 1)
				page = 1;

			if (page !== meta.page)
				self.page(page);
		});

		html && self.redrawcols(new Function('return ' + html.trim())());
		self.resizeforce();
	};

	self.sort = function(name) {
		// name_asc    : asc
		// name_desc   : desc
		// name        : off
		var arr = name.split('_');
		container_cols.find('.asc,.desc').rclass('asc desc');
		arr[1] && container_cols.find('> {0}-col[data-name="{1}"]'.format(cls2, arr[0])).aclass(arr[1]);
		meta.sort = arr.length ? name : undefined;
		self.page(meta.page);
	};

	self.page = function(page) {
		config.exec && EXEC(self.makepath(config.exec), meta.sort, page);
	};

	self.resize = function() {
		setTimeout2(self.ID, self.resizeforce, 500);
	};

	self.cacheempty = function() {
		var emptycontainer = container_rows.find(cls2 + '-empty-container')[0];
		if (emptycontainer)
			meta.empty = container_rows[0].removeChild(emptycontainer);
	};

	self.resizeforce = function() {

		var parent = config.height > 0 ? self.parent() : config.height === 'fluid' || config.height === 'auto' ? null : self.parent(config.height);
		var width = parent ? parent.width() : self.parent().width();
		var height = 0;
		var wh;

		if (config.height > 0)
			height = (config.height - config.margin);
		else if (config.height === 'auto') {
			wh = (config.parent ? self.parent(config.parent).height() : WH) - self.element.offset().top;
		} else if (parent)
			wh = parent.height();

		if (wh)
			height = (wh - container_cols.height() - container_pages.height() - config.margin);

		if (meta.rows) {

			var h = meta.rows.length * config.rowheight;

			if (!parent && config.height !== 'auto')
				height = h;

			var diff = parent ? Math.ceil((height - h) / config.rowheight) : Math.ceil((config.minheight - h) / config.rowheight);

			if (diff < 0)
				diff = 0;

			if (meta.hd !== diff) {

				if (diff > 0) {
					if (meta.empty) {
						container_rows[0].appendChild(meta.empty);
						meta.empty = null;
					}
				} else {
					if (!meta.empty)
						self.cacheempty();
				}

				self.tclass(cls + '-noscroll', diff > 0);
				self.scrollbar.scrollTop(0);
				meta.hd = diff;
			}
		}

		if (meta.ww === width && meta.wh === height) {
			self.scrollbar.resize();
			meta.width && container_rows.width(meta.width);
			return;
		}

		if (!parent) {
			if (height < config.minheight)
				height = config.minheight;
		}

		meta.ww = width;
		meta.wh = height;
		self.find(cls2 + '-rows-scroller').css('height', height);
		meta.width && container_rows.width(meta.width);
		container_cols.css('min-width', width);
		self.scrollbar.resize();

	};

	self.onscroll = function(e) {
		container_cols[0].parentNode.scrollLeft = e.area[0].scrollLeft;
	};

	self.renderrow = function(index, row) {

		var div = document.createElement('DIV');
		var tmp = [];
		var ccls = '';

		if (meta.rowclass)
			ccls = meta.rowclass(row).trim();

		div.setAttribute('class', cls + '-row' + (index % 2 ? (' ' + cls + '-row-odd') : '') + (ccls ? (' ' + ccls) : ''));
		div.setAttribute('data-index', index);

		for (var i = 0; i < meta.cols.length; i++) {
			var col = meta.cols[i];
			var value = row[col.name];

			if (col.template)
				value = col.template(row);

			ccls = '';

			if (row.CHANGES && row.CHANGES[col.name])
				ccls += ' ' + cls + '-changed';

			if (col.align)
				ccls += ' ' + col.align;

			tmp.push('<div class="{0}-row-col{4}" data-name="{1}" style="width:{2}px">{3}</div>'.format(cls, col.name, col.width, value, ccls));
		}

		div.innerHTML = tmp.join('');
		return div;
	};

	self.replacerow = function(index, row) {
		var el = container_rows.find(cls2 + '-row[data-index="{0}"]'.format(index));
		if (el.length) {
			self.get().rows[index] = row;
			container_rows[0].replaceChild(self.renderrow(index, row), el[0]);
		}
	};

	self.redrawchecked = function() {
		container_rows.find(cls2 + '-checked').rclass(cls + '-checked');
		var rows = container_rows.find(cls2 + '-row');
		for (var i = 0; i < rows.length; i++) {
			var el = rows[i];
			var index = +el.getAttribute('data-index');
			var row = meta.rows[index];
			if (meta.checked.indexOf(row) !== -1)
				$(el).aclass(cls + '-checked');
		}
		config.checked && SEEX(self.makepath(config.checked), meta.checked, self);
	};

	self.redrawrow = function(index) {

		if (typeof(index) === 'object')
			index = meta.rows.indexOf(index);

		if (index === -1)
			return;

		var el = container_rows.find(cls2 + '-row[data-index="{0}"]'.format(index));
		if (el.length) {
			var row = self.renderrow(index, meta.rows[index]);
			container_rows[0].replaceChild(row, el[0]);
			row = $(row);

			if (meta.checked.indexOf(meta.rows[index]) !== -1)
				row.aclass(cls + '-checked');

			return row;
		}
	};

	self.clear = function() {
		self.refresh();
	};

	self.rebind = self.redrawcols = function(cols) {

		var key = 'datatable' + HASH(cols);
		var builder = [];
		var empty = [];

		meta.id = key;
		meta.width = 0;
		meta.cols = [];
		meta.empty = '';

		for (var i = 0; i < cols.length; i++) {
			var col = cols[i];

			if (typeof(col) === 'string') {
				meta.rowclass = Tangular.compile(col);
				continue;
			}

			if (col.sort == null)
				col.sort = true;

			if (!col.width)
				col.width = config.colwidth;

			meta.cols.push(col);
			meta.width += col.width;

			if (col.align === 0)
				col.align = 'left';

			if (col.align === 1)
				col.align = 'center';

			if (col.align === 2)
				col.align = 'right';

			if (col.alignheader === 0)
				col.alignheader = 'left';

			if (col.alignheader === 1)
				col.alignheader = 'center';

			if (col.alignheader === 2)
				col.alignheader = 'right';

			if (!col.template && col.type) {
				switch (col.type.toLowerCase()) {
					case 'number':
						col.template = '{{ {0} | format({1}) }}'.format(col.name, col.format || '0');
						if (!col.align)
							col.align = 'right';
						if (!col.alignheader)
							col.alignheader = 'center';
						break;
					case 'currency':
						var curr = col.currency || col.format;
						if (curr)
							curr = '\'' + curr + '\'';
						col.template = '{{ {0} | currency({1}) }}'.format(col.name, curr);
						if (!col.align)
							col.align = 'right';
						if (!col.alignheader)
							col.alignheader = 'center';
						break;
					case 'boolean':
						col.template = '{{ {0} | ui_datatable_checkbox }}'.format(col.name);
						if (!col.align)
							col.align = 'center';
						if (!col.alignheader)
							col.alignheader = 'center';
						break;
					case 'date':
						col.template = '{{ {0} | format{1} }}'.format(col.name, col.format ? ('(\'' + col.format + '\')') : '');
						if (!col.align)
							col.align = 'center';
						if (!col.alignheader)
							col.alignheader = 'center';
						break;
				}
			}

			if (col.template)
				col.template = Tangular.compile(col.template);

			builder.push(template_col(col));
			empty.push('<div class="{0}-row-col" style="width:{1}px"></div>'.format(cls, col.width));
		}

		var sw = self.scrollbar.pathy.width();
		container_cols.css('width', meta.width + sw).html(builder.join(''));

		var tmp = Math.ceil((screen.height - 100) / config.rowheight);
		meta.empty = '<div class="{0}-empty">{1}</div>'.format(cls, empty.join(''));
		empty = [];
		for (var i = 0; i < tmp; i++)
			empty.push(meta.empty);

		var div = document.createElement('DIV');
		div.setAttribute('class', cls + '-empty-container');
		div.innerHTML = empty.join('');
		meta.empty = div;
	};

	self.select = function(row) {
		var index = meta.rows.indexOf(row);
		if (index !== -1) {
			var el = container_rows.find(cls2 + '-row[data-index="{0}"]'.format(index));
			meta.selected && meta.selected.rclass(cls + '-selected');
			meta.selected = el.aclass(cls + '-selected');
			meta.value = row[config.clickid];
			config.click && SEEX(self.makepath(config.click), row, self, el);
		}
	};

	self.setter = function(value, path, type) {

		if (!value) {
			self.page(1);
			return;
		}

		value.cols && self.redrawcols(value.cols);

		var rows = value.rows || value.items;
		meta.rows = rows;
		meta.page = value.page || 1;
		meta.pages = value.pages || 1;
		meta.count = value.count;
		meta.checked = [];
		meta.changed = [];
		temp.index = -1;

		var dom = container_rows[0];

		self.cacheempty();
		dom.innerHTML = '';

		for (var i = 0; i < rows.length; i++)
			dom.appendChild(self.renderrow(i, rows[i]));

		meta.hd = null;
		self.resizeforce();

		if (type !== 'noscroll')
			self.scrollbar.scrollTop(0);

		var pages = value.pages ? (value.pages.pluralize(config.pluralizepages) + ' / ') : '';
		container_pages.find(cls2 + '-info').html(pages + (value.count || rows.length).pluralize(config.pluralizeitems));
		var buttons = container_pages.find('button');
		buttons[0].disabled = meta.page <= 1;
		buttons[1].disabled = meta.page >= meta.pages;
		container_pages.find('input').val(meta.page)[0].disabled = meta.pages === 1;

		var selectindex = meta.selected ? +meta.selected.attrd('index') : null;
		if (selectindex == null && config.autoselect && rows && rows.length)
			selectindex = 0;

		if (selectindex != null) {
			setTimeout(function(rows, index) {
				self.select(rows[index]);
			}, 1, rows, selectindex);
		}

		config.click && SEEX(self.makepath(config.click), null, self);
		config.checked && SEEX(self.makepath(config.checked), meta.checked, self);
	};

});

COMPONENT('approve', 'cancel:Cancel', function(self, config, cls) {

	var cls2 = '.' + cls;
	var events = {};
	var buttons;
	var oldcancel;

	self.readonly();
	self.singleton();
	self.nocompile && self.nocompile();

	self.make = function() {

		self.aclass(cls + ' hidden');
		self.html('<div><div class="{0}-body"><span class="{0}-close"><i class="fa fa-times"></i></span><div class="{0}-content"></div><div class="{0}-buttons"><button data-index="0"></button><button data-index="1"></button></div></div></div>'.format(cls));

		buttons = self.find(cls2 + '-buttons').find('button');

		self.event('click', 'button', function() {
			self.hide(+$(this).attrd('index'));
		});

		self.event('click', cls2 + '-close', function() {
			self.callback = null;
			self.hide(-1);
		});

		self.event('click', function(e) {
			var t = e.target.tagName;
			if (t !== 'DIV')
				return;
			var el = self.find(cls2 + '-body');
			el.aclass(cls + '-click');
			setTimeout(function() {
				el.rclass(cls + '-click');
			}, 300);
		});
	};

	events.keydown = function(e) {
		var index = e.which === 13 ? 0 : e.which === 27 ? 1 : null;
		if (index != null) {
			self.find('button[data-index="{0}"]'.format(index)).trigger('click');
			e.preventDefault();
			e.stopPropagation();
			events.unbind();
		}
	};

	events.bind = function() {
		$(W).on('keydown', events.keydown);
	};

	events.unbind = function() {
		$(W).off('keydown', events.keydown);
	};

	self.show = function(message, a, b, fn) {

		if (typeof(b) === 'function') {
			fn = b;
			b = config.cancel;
		}

		if (M.scope)
			self.currscope = M.scope();

		self.callback = fn;

		var icon = a.match(/"[a-z0-9-\s]+"/);
		if (icon) {

			var tmp = icon + '';
			if (tmp.indexOf(' ') == -1)
				tmp = 'fa fa-' + tmp;

			a = a.replace(icon, '').trim();
			icon = '<i class="{0}"></i>'.format(tmp.replace(/"/g, ''));
		} else
			icon = '';

		var color = a.match(/#[0-9a-f]+/i);
		if (color)
			a = a.replace(color, '').trim();

		buttons.eq(0).css('background-color', color || '').html(icon + a);

		if (oldcancel !== b) {
			oldcancel = b;
			buttons.eq(1).html(b);
		}

		self.find(cls2 + '-content').html(message.replace(/\n/g, '<br />'));
		$('html').aclass(cls + '-noscroll');
		self.rclass('hidden');
		events.bind();
		self.aclass(cls + '-visible', 5);
	};

	self.hide = function(index) {

		if (!index) {
			self.currscope && M.scope(self.currscope);
			self.callback && self.callback(index);
		}

		self.rclass(cls + '-visible');
		events.unbind();
		setTimeout2(self.id, function() {
			$('html').rclass(cls + '-noscroll');
			self.aclass('hidden');
		}, 1000);
	};
});

COMPONENT('table', 'highlight:true;unhighlight:true;multiple:false;pk:id;visibleY:1;scrollbar:0;pluralizepages:# pages,# page,# pages,# pages;pluralizeitems:# items,# item,# items,# items;margin:0', function(self, config, cls) {

	var cls2 = '.' + cls;
	var etable, ebody, eempty, ehead, eheadsize, efooter, container;
	var opt = { selected: [] };
	var templates = {};
	var sizes = {};
	var names = {};
	var aligns = {};
	var sorts = {};
	var dcompile = false;
	var prevsort;
	var prevhead;
	var extradata;

	self.readonly();
	self.nocompile();
	self.bindvisible();

	self.make = function() {

		self.aclass(cls + ' invisible' + (config.detail ? (' ' + cls + '-detailed') : '') + ((config.highlight || config.click || config.exec) ? (' ' + cls + '-selectable') : '') + (config.border ? (' ' + cls + '-border') : '') + (config.flat ? (' ' + cls + '-flat') : '') + (config.noborder ? (' noborder') : ''));

		self.find('script').each(function() {

			var el = $(this);
			var type = el.attrd('type');

			switch (type) {
				case 'detail':
					var h = el.html();
					dcompile = h.COMPILABLE();
					templates.detail = Tangular.compile(h);
					return;
				case 'empty':
					templates.empty = el.html();
					return;
			}

			var display = (el.attrd('display') || '').toLowerCase();
			var template = Tangular.compile(el.html());
			var size = (el.attrd('size') || '').split(',');
			var name = (el.attrd('head') || '').split(',');
			var align = (el.attrd('align') || '').split(',');
			var sort = (el.attrd('sort') || '').split(',');
			var i;

			for (i = 0; i < align.length; i++) {
				switch (align[i].trim()) {
					case '0':
						align[i] = 'left';
						break;
					case '1':
						align[i] = 'center';
						break;
					case '2':
						align[i] = 'right';
						break;
				}
			}

			display = (display || '').split(',').trim();

			for (i = 0; i < align.length; i++)
				align[i] = align[i].trim();

			for (i = 0; i < size.length; i++)
				size[i] = size[i].trim().toLowerCase();

			for (i = 0; i < sort.length; i++)
				sort[i] = sort[i].trim();

			for (i = 0; i < name.length; i++) {
				name[i] = name[i].trim().replace(/'[a-z-\s]+'/, function(val) {
					if (val.indexOf(' ') === -1)
						val = val + ' fa';
					return '<i class="fa-{0}"></i>'.format(val.replace(/'/g, ''));
				});
			}

			if (!size[0] && size.length === 1)
				size = EMPTYARRAY;

			if (!align[0] && align.length === 1)
				align = EMPTYARRAY;

			if (!name[0] && name.length === 1)
				name = EMPTYARRAY;

			if (display.length) {
				for (i = 0; i < display.length; i++) {
					templates[display[i]] = template;
					sizes[display[i]] = size.length ? size : null;
					names[display[i]] = name.length ? name : null;
					aligns[display[i]] = align.length ? align : null;
					sorts[display[i]] = sort.length ? sort : null;
				}
			} else {
				templates.lg = templates.md = templates.sm = templates.xs = template;
				sizes.lg = sizes.md = sizes.sm = sizes.xs = size.length ? size : null;
				names.lg = names.md = names.sm = names.xs = name.length ? name : null;
				sorts.lg = sorts.md = sorts.sm = sorts.xs = sort.length ? sort : null;
				aligns.lg = aligns.md = aligns.sm = aligns.xs = align.length ? align : null;
			}
		});

		self.html('<div class="{0}-headcontainer"><table class="{0}-head"><thead></thead></table></div><div class="{0}-container"><table class="{0}-table"><thead></thead><tbody class="{0}-tbody"></tbody></table><div class="{0}-empty hidden"></div></div>'.format(cls));
		etable = self.find(cls2 + '-table');
		ebody = etable.find('tbody');
		eempty = self.find(cls2 + '-empty').html(templates.empty || '');
		ehead = self.find(cls2 + '-head thead');
		eheadsize = etable.find('thead');
		container = self.find(cls2 + '-container');

		etable.on('click', 'button', function() {
			if (config.click) {
				var btn = $(this);
				var row = opt.items[+btn.closest('tr').attrd('index')];
				self.SEEX(config.click, btn[0].name, row, btn);
			}
		});

		if (config.paginate) {
			self.append('<div class="{0}-footer"><div class={0}-pagination-items hidden-xs"></div><div class="{0}-pagination"><button name="page-first" disabled><i class="fa fa-angle-double-left"></i></button><button name="page-prev" disabled><i class="fa fa-angle-left"></i></button><div><input type="text" name="page" maxlength="5" class="{0}-pagination-input" /></div><button name="page-next" disabled><i class="fa fa-angle-right"></i></button><button name="page-last" disabled><i class="fa fa-angle-double-right"></i></button></div><div class="{0}-pagination-pages"></div></div>'.format(cls));
			efooter = self.find(cls2 + '-footer');

			efooter.on('change', cls2 + '-pagination-input', function() {

				var value = self.get();
				var val = +this.value;

				if (isNaN(val))
					return;

				if (val >= value.pages)
					val = value.pages;
				else if (val < 1)
					val = 1;

				value.page = val;
			});

			efooter.on('click', 'button', function() {
				var data = self.get();

				var model = {};
				model.page = data.page;
				model.limit = data.limit;

				if (prevsort)
					model.sort = prevsort && prevsort.type ? (prevsort.name + '_' + prevsort.type) : '';

				switch (this.name) {
					case 'page-first':
						model.page = 1;
						self.SEEX(config.paginate, model);
						break;
					case 'page-last':
						model.page = data.pages;
						self.SEEX(config.paginate, model);
						break;
					case 'page-prev':
						model.page -= 1;
						self.SEEX(config.paginate, model);
						break;
					case 'page-next':
						model.page += 1;
						self.SEEX(config.paginate, model);
						break;
				}
			});
		}

		if (config.scrollbar) {
			self.scrollbar = SCROLLBAR(container, { visibleY: !!config.visibleY });
			ehead.parent().parent().aclass(cls + '-scrollbar');
		}

		templates.empty && templates.empty.COMPILABLE() && COMPILE(eempty);

		self.event('click', '.sort', function() {

			var th = $(this);
			var i = th.find('i');
			var type;

			if (i.attr('class') === 'fa') {
				// no sort
				prevsort && prevsort.el.find('i').rclass2('fa-');
				i.aclass('fa-long-arrow-up');
				type = 'asc';
			} else if (i.hclass('fa-long-arrow-up')) {
				// ascending
				i.rclass('fa-long-arrow-up').aclass('fa-long-arrow-down');
				type = 'desc';
			} else if (i.hclass('fa-long-arrow-down')) {
				// descending
				i.rclass('fa-long-arrow-down');
				type = '';
			}

			var index = th.index();
			var data = self.get();

			prevsort = { index: index, type: type, el: th, name: sorts[WIDTH()][index] };

			if (config.paginate) {
				var model = {};
				model.page = data.page;
				model.limit = data.limit;
				model.sort = type ? (prevsort.name + '_' + type) : undefined;
				self.SEEX(config.paginate, model);
			} else if (prevsort.name) {
				opt.items = (data.items ? data.items : data).slice(0);
				if (type)
					opt.items.quicksort(prevsort.name, type === 'asc');
				else {
					var tmp = self.get() || EMPTYARRAY;
					opt.items = tmp.items ? tmp.items : tmp;
					prevsort = null;
				}
				opt.sort = type ? (prevsort.name + '_' + type) : undefined;
				config.filter && self.EXEC(config.filter, opt, 'sort');
				self.redraw();
			}
		});

		var blacklist = { A: 1, BUTTON: 1 };
		var dblclick = 0;

		var forceselect = function(el, index, is) {

			if (!config.highlight) {
				config.exec && self.SEEX(config.exec, opt.items[index], el);
				return;
			}

			if (config.multiple) {
				if (is) {
					if (config.unhighlight) {
						el.rclass(cls + '-selected');
						config.detail && self.row_detail(el);
						opt.selected = opt.selected.remove(index);
						config.exec && self.SEEX(config.exec, self.selected(), el);
					}
				} else {
					el.aclass(cls + '-selected');
					config.exec && self.SEEX(config.exec, self.selected(), el);
					config.detail && self.row_detail(el);
					opt.selected.push(index);
				}
			} else {

				if (is && !config.unhighlight)
					return;

				if (opt.selrow) {
					opt.selrow.rclass(cls + '-selected');
					config.detail && self.row_detail(opt.selrow);
					opt.selrow = null;
					opt.selindex = -1;
				}

				// Was selected
				if (is) {
					config.exec && self.SEEX(config.exec);
					return;
				}

				opt.selindex = index;
				opt.selrow = el;
				el.aclass(cls + '-selected');
				config.exec && self.SEEX(config.exec, opt.items[index], el);
				config.detail && self.row_detail(el);
			}
		};

		ebody.on('click', '> tr', function(e) {

			var el = $(this);
			var node = e.target;

			if (blacklist[node.tagName] || (node.tagName === 'SPAN' && node.getAttribute('class') || '').indexOf('link') !== -1)
				return;

			if (node.tagName === 'I') {
				var parent = $(node).parent();
				if (blacklist[parent[0].tagName] || (parent[0].tagName === 'SPAN' && parent.hclass('link')))
					return;
			}

			var now = Date.now();
			var isdblclick = dblclick ? (now - dblclick) < 250 : false;
			dblclick = now;

			var index = +el.attrd('index');
			if (index > -1) {

				var is = config.highlight ? el.hclass(cls + '-selected') : true;
				if (isdblclick && config.dblclick && is) {
					self.forceselectid && clearTimeout(self.forceselectid);
					self.SEEX(config.dblclick, opt.items[index], el);
					return;
				}

				self.forceselectid && clearTimeout(self.forceselectid);
				self.forceselectid = setTimeout(forceselect, config.dblclick ? is ? 250 : 1 : 1, el, index, is);
			}
		});

		var resize = function() {
			setTimeout2(self.ID, self.resize, 500);
		};

		$(W).on('resize', resize);
	};

	self.resize2 = function() {
		self.scrollbar && setTimeout2(self.ID + 'scrollbar', self.scrollbar.resize, 300);
	};

	self.resize = function() {

		var display = WIDTH();
		if (display !== opt.display && sizes[display] && sizes[display] !== sizes[opt.display]) {
			self.refresh();
			return;
		}

		if (config.height > 0)
			self.find(cls2 + '-container').css('height', config.height - config.margin);
		else if (config.height) {
			var el = self.parent(config.height);
			var header = self.find(cls2 + '-head');
			var plus = (config.noborder ? 0 : 2);
			var footer = config.paginate ? (self.find(cls2 + '-footer').height() + plus) : 0;
			self.find(cls2 + '-container').css('height', el.height() - header.height() - footer - plus - config.margin);
		}

		self.scrollbar && self.scrollbar.resize();
	};

	self.row_detail = function(el) {

		var index = +el.attrd('index');
		var row = opt.items[index];
		var eld = el.next();

		if (el.hclass(cls + '-selected')) {

			// Row is selected
			if (eld.hclass(cls + '-detail')) {
				// Detail exists
				eld.rclass('hidden');
			} else {

				// Detail doesn't exist
				el.after('<tr class="{0}-detail"><td colspan="{1}" data-index="{2}"></td></tr>'.format(cls, el.find('td').length, index));
				eld = el.next();

				var tmp;

				if (config.detail === true) {
					tmp = eld.find('td');
					tmp.html(templates.detail(row, { index: index, user: window.user, data: extradata }));
					dcompile && COMPILE(tmp);
				} else {
					tmp = eld.find('td');
					self.EXEC(config.detail, row, function(row) {
						var is = typeof(row) === 'string';
						tmp.html(is ? row : templates.detail(row, { index: index, user: window.user, data: extradata }));
						if ((is && row.COMPILABLE()) || dcompile)
							COMPILE(tmp);
					}, tmp);
				}
			}

		} else
			eld.hclass(cls + '-detail') && eld.aclass('hidden');

		self.resize2();
	};

	self.redrawrow = function(index, row) {

		if (typeof(index) === 'number')
			index = ebody.find('tr[data-index="{0}"]'.format(index));

		if (index.length) {
			var template = templates[opt.display];
			var indexer = {};
			indexer.data = extradata;
			indexer.user = W.user;
			indexer.index = +index.attrd('index');
			var is = index.hclass(cls + '-selected');
			var next = index.next();
			index.replaceWith(template(row, indexer).replace('<tr', '<tr data-index="' + indexer.index + '"'));
			next.hclass(cls + '-detail') && next.remove();
			is && ebody.find('tr[data-index="{0}"]'.format(indexer.index)).trigger('click');
		}
	};

	self.appendrow = function(row) {

		var index = opt.items.indexOf(row);
		if (index == -1)
			index = opt.items.push(row) - 1;

		var template = templates[opt.display];
		var indexer = {};
		indexer.data = extradata;
		indexer.user = W.user;
		indexer.index = index;
		ebody.append(template(row, indexer).replace('<tr', '<tr data-index="' + indexer.index + '"'));
	};

	self.removerow = function(row) {
		var index = opt.items.indexOf(row);
		if (index == -1)
			return;
		opt.selected = opt.selected.remove(index);
		opt.items.remove(row);
	};

	self.redraw = function() {
		var clsh = 'hidden';
		var count = 0;
		var indexer = { user: W.user, data: extradata };
		var builder = [];
		var template = templates[WIDTH()];
		if (template) {
			for (var i = 0; i < opt.items.length; i++) {
				var item = opt.items[i];
				count++;
				indexer.index = i;
				builder.push(template(item, indexer).replace('<tr', '<tr data-index="' + i + '"'));
			}
		}
		count && ebody.html(builder.join(''));
		eempty.tclass(clsh, count > 0);
		etable.tclass(clsh, count == 0);
		config.redraw && self.EXEC(config.redraw, self);
	};

	self.redrawpagination = function() {

		if (!config.paginate)
			return;

		var value = self.get();
		efooter.find('button').each(function() {

			var el = $(this);
			var dis = true;

			switch (this.name) {
				case 'page-next':
					dis = value.page >= value.pages;
					break;
				case 'page-prev':
					dis = value.page === 1;
					break;
				case 'page-last':
					dis = !value.pages || value.page === value.pages;
					break;
				case 'page-first':
					dis = value.page === 1;
					break;
			}

			el.prop('disabled', dis);
		});

		efooter.find('input')[0].value = value.page;
		efooter.find(cls2 + '-pagination-pages')[0].innerHTML = value.pages.pluralize.apply(value.pages, config.pluralizepages);
		efooter.find(cls2 + '-pagination-items')[0].innerHTML = value.count.pluralize.apply(value.count, config.pluralizeitems);
	};

	self.selected = function() {
		var rows = [];
		for (var i = 0; i < opt.selected.length; i++) {
			var row = opt.items[opt.selected[i]];
			row && rows.push(row);
		}
		return rows;
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'pluralizepages':
				config.pluralizepages = value.split(',').trim();
				break;
			case 'pluralizeitems':
				config.pluralizeitems = value.split(',').trim();
				break;
			case 'datasource':
				self.datasource(value, self.bind);
				break;
			case 'paginate':
			case 'exec':
			case 'click':
			case 'filter':
			case 'redraw':
				if (value && value.SCOPE)
					config[key] = value.SCOPE(self, value);
				break;
		}
	};

	self.bind = function(path, val) {
		extradata = val;
	};

	self.setter = function(value) {

		if (config.paginate && value == null) {
			var model = {};
			model.page = 1;
			if (prevsort)
				model.sort = prevsort && prevsort.type ? (prevsort.name + '_' + prevsort.type) : '';
			self.EXEC(config.paginate, model);
			return;
		}

		var data = value ? value.items ? value.items : value : value;
		var empty = !data || !data.length;
		var clsh = 'hidden';

		if (!self.isinit) {
			self.rclass('invisible', 10);
			self.isinit = true;
		}

		var display = WIDTH();
		var builder = [];
		var buildersize = [];
		var selected = opt.selected.slice(0);

		for (var i = 0; i < selected.length; i++) {
			var row = opt.items[selected[i]];
			selected[i] = row[config.pk];
		}

		var size = sizes[display];
		var name = names[display];
		var align = aligns[display];
		var sort = sorts[display];

		if (prevhead !== display) {
			if ((size && size.length) || (name && name.length) || (align && align.length)) {

				var arr = name || size || align;

				for (var i = 0; i < arr.length; i++) {
					var w = !size || size[i] === '0' ? 'auto' : size[i];
					builder.push('<th style="width:{0};text-align:{2}"{3}>{1}</th>'.format(w, (sort && sort[i] ? '<i class="fa"></i>' : '') + (name ? name[i] : ''), align ? align[i] : 'left', sort && sort[i] ? ' class="sort"' : ''));
					buildersize.push('<th style="width:{0}"></th>'.format(w));
				}

				ehead.parent().tclass('hidden', !name);
				ehead.html('<tr>{0}</tr>'.format(builder.join('')));
				eheadsize.html('<tr>{0}</tr>'.format(buildersize.join('')));

			} else
				ehead.html('');

			prevsort = null;
			prevhead = display;
		}

		setTimeout(self.resize, 100);

		opt.display = display;
		opt.items = data ? data.slice(0) : 0;
		opt.data = value;
		opt.selindex = -1;
		opt.selrow = null;
		opt.selected = [];
		opt.sort = prevsort;

		self.redrawpagination();
		config.filter && self.EXEC(config.filter, opt, 'refresh');
		config.exec && self.SEEX(config.exec, config.multiple ? [] : null);

		if (empty) {
			etable.aclass(clsh);
			eempty.rclass(clsh);
			return;
		}

		self.redraw();

		if (config.remember) {
			for (var i = 0; i < selected.length; i++) {
				if (selected[i]) {
					var index = opt.items.findIndex(config.pk, selected[i]);
					if (index !== -1)
						ebody.find('tr[data-index="{0}"]'.format(index)).trigger('click');
				}
			}
		}
	};

});

COMPONENT('viewbox', 'margin:0;scroll:true;delay:100;scrollbar:0;visibleY:1;height:100;invisible:1', function(self, config, cls) {

	var eld, elb;
	var scrollbar;
	var cls2 = '.' + cls;
	var init = false;

	self.readonly();

	self.init = function() {
		var obj;
		if (W.OP)
			obj = W.OP;
		else
			obj = $(W);

		var resize = function() {
			for (var i = 0; i < M.components.length; i++) {
				var com = M.components[i];
				if (com.name === 'viewbox' && com.dom.offsetParent && com.$ready && !com.$removed)
					com.resize();
			}
		};

		obj.on('resize', function() {
			setTimeout2('viewboxresize', resize, 200);
		});
	};

	self.destroy = function() {
		scrollbar && scrollbar.destroy();
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'disabled':
				eld.tclass('hidden', !value);
				break;
			case 'minheight':
			case 'margin':
			case 'marginxs':
			case 'marginsm':
			case 'marginmd':
			case 'marginlg':
				!init && self.resize();
				break;
			case 'selector': // backward compatibility
				config.parent = value;
				self.resize();
				break;
		}
	};

	self.scrollbottom = function(val) {
		if (val == null)
			return elb[0].scrollTop;
		elb[0].scrollTop = (elb[0].scrollHeight - self.dom.clientHeight) - (val || 0);
		return elb[0].scrollTop;
	};

	self.scrolltop = function(val) {
		if (val == null)
			return elb[0].scrollTop;
		elb[0].scrollTop = (val || 0);
		return elb[0].scrollTop;
	};

	self.make = function() {
		if (config.invisible)
			self.aclass('invisible');
		config.scroll && MAIN.version > 17 && self.element.wrapInner('<div class="ui-viewbox-body"></div>');
		self.element.prepend('<div class="ui-viewbox-disabled hidden"></div>');
		eld = self.find('> .{0}-disabled'.format(cls)).eq(0);
		elb = self.find('> .{0}-body'.format(cls)).eq(0);
		self.aclass('{0} {0}-hidden'.format(cls));
		if (config.scroll) {
			if (config.scrollbar) {
				if (MAIN.version > 17) {
					scrollbar = W.SCROLLBAR(self.find(cls2 + '-body'), { visibleY: config.visibleY, visibleX: config.visibleX, orientation: config.visibleX ? null : 'y', parent: self.element });
					self.scrolltop = scrollbar.scrollTop;
					self.scrollbottom = scrollbar.scrollBottom;
				} else
					self.aclass(cls + '-scroll');
			} else {
				self.aclass(cls + '-scroll');
				self.find(cls2 + '-body').aclass('noscrollbar');
			}
		}
		self.resize();
	};

	self.released = function(is) {
		!is && self.resize();
	};

	var css = {};

	self.resize = function(scrolltop) {

		if (self.release())
			return;

		var el = self.parent(config.parent);
		var h = el.height();
		var w = el.width();
		var width = WIDTH();
		var margin = config.margin;
		var responsivemargin = config['margin' + width];

		if (responsivemargin != null)
			margin = responsivemargin;

		if (margin === 'auto')
			margin = self.element.offset().top;

		if (h === 0 || w === 0) {
			self.$waiting && clearTimeout(self.$waiting);
			self.$waiting = setTimeout(self.resize, 234);
			return;
		}

		h = ((h / 100) * config.height) - margin;

		if (config.minheight && h < config.minheight)
			h = config.minheight;

		css.height = h;
		css.width = self.element.width();
		eld.css(css);

		css.width = null;
		self.css(css);
		elb.length && elb.css(css);
		self.element.SETTER('*', 'resize');
		var c = cls + '-hidden';
		self.hclass(c) && self.rclass(c, 100);
		scrollbar && scrollbar.resize();
		scrolltop && self.scrolltop(0);

		if (!init) {
			self.rclass('invisible', 250);
			init = true;
		}
	};

	self.resizescrollbar = function() {
		scrollbar && scrollbar.resize();
	};

	self.setter = function() {
		setTimeout(self.resize, config.delay, config.scrolltop);
	};
});

COMPONENT('menu', function(self, config, cls) {

	self.singleton();
	self.readonly();
	self.nocompile && self.nocompile();

	var cls2 = '.' + cls;

	var is = false;
	var issubmenu = false;
	var isopen = false;
	var events = {};
	var ul, children, prevsub, parentclass;

	self.make = function() {
		self.aclass(cls + ' hidden');
		self.append('<div class="{0}-items"><ul></ul></div><div class="{0}-submenu hidden"><ul></ul></div>'.format(cls));
		ul = self.find(cls2 + '-items').find('ul');
		children = self.find(cls2 + '-submenu');

		self.event('click', 'li', function(e) {

			clearTimeout2(self.ID);

			var el = $(this);
			if (!el.hclass(cls + '-divider') && !el.hclass(cls + '-disabled')) {
				self.opt.scope && M.scope(self.opt.scope);
				var index = el.attrd('index').split('-');
				if (index.length > 1) {
					// submenu
					self.opt.callback(self.opt.items[+index[0]].children[+index[1]]);
					self.hide();
				} else if (!issubmenu) {
					self.opt.callback(self.opt.items[+index[0]]);
					self.hide();
				}
			}

			e.preventDefault();
			e.stopPropagation();
		});

		events.hide = function() {
			is && self.hide();
		};

		self.event('scroll', events.hide);
		self.on('reflow', events.hide);
		self.on('scroll', events.hide);
		self.on('resize', events.hide);

		events.click = function(e) {
			if (is && !isopen && (!self.target || (self.target !== e.target && !self.target.contains(e.target))))
				setTimeout2(self.ID, self.hide, isMOBILE ? 700 : 300);
		};

		events.hidechildren = function() {
			if ($(this.parentNode.parentNode).hclass(cls + '-items')) {
				if (prevsub && prevsub[0] !== this) {
					prevsub.rclass(cls + '-selected');
					prevsub = null;
					children.aclass('hidden');
					issubmenu = false;
				}
			}
		};

		events.children = function() {

			if (prevsub && prevsub[0] !== this) {
				prevsub.rclass(cls + '-selected');
				prevsub = null;
			}

			issubmenu = true;
			isopen = true;

			setTimeout(function() {
				isopen = false;
			}, 500);

			var el = prevsub = $(this);
			var index = +el.attrd('index');
			var item = self.opt.items[index];

			el.aclass(cls + '-selected');

			var html = self.makehtml(item.children, index);
			children.find('ul').html(html);
			children.rclass('hidden');

			var css = {};
			var offset = el.position();

			css.left = ul.width() - 5;
			css.top = offset.top - 5;

			var offsetX = offset.left;

			offset = self.element.offset();

			var w = children.width();
			var left = offset.left + css.left + w;
			if (left > WW + 30)
				css.left = (offsetX - w) + 5;

			children.css(css);
		};
	};

	self.bindevents = function() {
		events.is = true;
		$(document).on('touchstart mouseenter mousedown', cls2 + '-children', events.children);
		$(document).on('touchstart mousedown', events.click);
		$(window).on('scroll', events.hide);
		self.element.on('mouseenter', 'li', events.hidechildren);
	};

	self.unbindevents = function() {
		events.is = false;
		$(document).off('touchstart mouseenter mousedown', cls2 + '-children', events.children);
		$(document).off('touchstart mousedown', events.click);
		$(window).off('scroll', events.hide);
		self.element.off('mouseenter', 'li', events.hidechildren);
	};

	self.showxy = function(x, y, items, callback) {
		var opt = {};
		opt.x = x;
		opt.y = y;
		opt.items = items;
		opt.callback = callback;
		self.show(opt);
	};

	self.makehtml = function(items, index) {
		var builder = [];
		var tmp;

		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			if (typeof(item) === 'string') {
				// caption or divider
				if (item === '-')
					tmp = '<hr />';
				else
					tmp = '<span>{0}</span>'.format(item);
				builder.push('<li class="{0}-divider">{1}</li>'.format(cls, tmp));
				continue;
			}

			var cn = item.classname || '';
			var icon = '';

			if (item.icon)
				icon = '<i class="{0}"></i>'.format(item.icon.charAt(0) === '!' ? item.icon.substring(1) : item.icon.indexOf('fa-') === -1 ? ('fa fa-' + item.icon) : item.icon);
			else
				cn = (cn ? (cn + ' ') : '') + cls + '-nofa';

			tmp = '';

			if (index == null && item.children && item.children.length) {
				cn += (cn ? ' ' : '') + cls + '-children';
				tmp += '<i class="fa fa-play pull-right"></i>';
			}

			if (item.selected)
				cn += (cn ? ' ' : '') + cls + '-selected';

			if (item.disabled)
				cn += (cn ? ' ' : '') + cls + '-disabled';

			tmp += '<div class="{0}-name">{1}{2}{3}</div>'.format(cls, icon, item.name, item.shortcut ? '<b>{0}</b>'.format(item.shortcut) : '');

			if (item.note)
				tmp += '<div class="ui-menu-note">{0}</div>'.format(item.note);

			builder.push('<li class="{0}" data-index="{2}">{1}</li>'.format(cn, tmp, (index != null ? (index + '-') : '') + i));
		}

		return builder.join('');
	};

	self.show = function(opt) {

		if (typeof(opt) === 'string') {
			// old version
			opt = { align: opt };
			opt.element = arguments[1];
			opt.items = arguments[2];
			opt.callback = arguments[3];
			opt.offsetX = arguments[4];
			opt.offsetY = arguments[5];
		}

		var tmp = opt.element ? opt.element instanceof jQuery ? opt.element[0] : opt.element.element ? opt.element.dom : opt.element : null;

		if (is && tmp && self.target === tmp) {
			self.hide();
			return;
		}

		var tmp;

		self.target = tmp;
		self.opt = opt;
		opt.scope = M.scope();

		if (parentclass && opt.classname !== parentclass) {
			self.rclass(parentclass);
			parentclass = null;
		}

		if (opt.large)
			self.aclass('ui-large');
		else
			self.rclass('ui-large');

		isopen = false;
		issubmenu = false;
		prevsub = null;

		var css = {};
		children.aclass('hidden');
		children.find('ul').empty();
		clearTimeout2(self.ID);

		ul.html(self.makehtml(opt.items));

		if (!parentclass && opt.classname) {
			self.aclass(opt.classname);
			parentclass = opt.classname;
		}

		if (is) {
			css.left = 0;
			css.top = 0;
			self.element.css(css);
		} else {
			self.rclass('hidden');
			self.aclass(cls + '-visible', 100);
			is = true;
			if (!events.is)
				self.bindevents();
		}

		var target = $(opt.element);
		var w = self.width();
		var offset = target.offset();

		if (opt.element) {
			switch (opt.align) {
				case 'center':
					css.left = Math.ceil((offset.left - w / 2) + (target.innerWidth() / 2));
					break;
				case 'right':
					css.left = (offset.left - w) + target.innerWidth();
					break;
				default:
					css.left = offset.left;
					break;
			}

			css.top = opt.position === 'bottom' ? (offset.top - self.element.height() - 10) : (offset.top + target.innerHeight() + 10);

		} else {
			css.left = opt.x;
			css.top = opt.y;
		}

		if (opt.offsetX)
			css.left += opt.offsetX;

		if (opt.offsetY)
			css.top += opt.offsetY;

		self.element.css(css);
	};

	self.hide = function() {
		events.is && self.unbindevents();
		is = false;
		self.opt && self.opt.hide && self.opt.hide();
		self.target = null;
		self.opt = null;
		self.aclass('hidden');
		self.rclass(cls + '-visible');
	};

});

COMPONENT('form', 'zindex:12;scrollbar:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var container;
	var csspos = {};

	if (!W.$$form) {

		W.$$form_level = W.$$form_level || 1;
		W.$$form = true;

		$(document).on('click', cls2 + '-button-close', function() {
			SET($(this).attrd('path'), '');
		});

		var resize = function() {
			setTimeout2('form', function() {
				for (var i = 0; i < M.components.length; i++) {
					var com = M.components[i];
					if (com.name === 'form' && !HIDDEN(com.dom) && com.$ready && !com.$removed)
						com.resize();
				}
			}, 200);
		};

		ON('resize2', resize);

		$(document).on('click', cls2 + '-container', function(e) {

			var el = $(e.target);
			if (e.target === this || el.hclass(cls + '-container-padding')) {
				var com = $(this).component();
				if (com && com.config.closeoutside) {
					com.set('');
					return;
				}
			}

			if (!(el.hclass(cls + '-container-padding') || el.hclass(cls + '-container')))
				return;

			var form = $(this).find(cls2);
			var c = cls + '-animate-click';
			form.aclass(c);

			setTimeout(function() {
				form.rclass(c);
			}, 300);
		});
	}

	self.readonly();
	self.submit = function() {
		if (config.submit)
			self.EXEC(config.submit, self.hide, self.element);
		else
			self.hide();
	};

	self.cancel = function() {
		config.cancel && self.EXEC(config.cancel, self.hide);
		self.hide();
	};

	self.hide = function() {
		if (config.independent)
			self.hideforce();
		self.esc(false);
		self.set('');
	};

	self.icon = function(value) {
		var el = this.rclass2('fa');
		value.icon && el.aclass(value.icon.indexOf(' ') === -1 ? ('fa fa-' + value.icon) : value.icon);
		el.tclass('hidden', !value.icon);
	};

	self.resize = function() {

		if (self.scrollbar) {
			container.css('height', WH);
			self.scrollbar.resize();
		}

		if (!config.center || self.hclass('hidden'))
			return;

		var ui = self.find(cls2);
		var fh = ui.innerHeight();
		var wh = WH;
		var r = (wh / 2) - (fh / 2);
		csspos.marginTop = (r > 30 ? (r - 15) : 20) + 'px';
		ui.css(csspos);
	};

	self.make = function() {

		$(document.body).append('<div id="{0}" class="hidden {4}-container invisible"><div class="{4}-scrollbar"><div class="{4}-container-padding"><div class="{4}" style="max-width:{1}px"><div data-bind="@config__text span:value.title__change .{4}-icon:@icon" class="{4}-title"><button name="cancel" class="{4}-button-close{3}" data-path="{2}"><i class="fa fa-times"></i></button><i class="{4}-icon"></i><span></span></div></div></div></div>'.format(self.ID, config.width || 800, self.path, config.closebutton == false ? ' hidden' : '', cls));

		var scr = self.find('> script');
		self.template = scr.length ? scr.html().trim() : '';
		if (scr.length)
			scr.remove();

		var el = $('#' + self.ID);
		var body = el.find(cls2)[0];
		container = el.find(cls2 + '-scrollbar');

		if (config.scrollbar) {
			el.css('overflow', 'hidden');
			self.scrollbar = SCROLLBAR(el.find(cls2 + '-scrollbar'), { visibleY: 1, orientation: 'y' });
		}

		while (self.dom.children.length)
			body.appendChild(self.dom.children[0]);

		self.rclass('hidden invisible');
		self.replace(el, true);

		self.event('scroll', function() {
			EMIT('scroll', self.name);
			EMIT('reflow', self.name);
		});

		self.event('click', 'button[name]', function() {
			var t = this;
			switch (t.name) {
				case 'submit':
					self.submit(self.hide);
					break;
				case 'cancel':
					!t.disabled && self[t.name](self.hide);
					break;
			}
		});

		config.enter && self.event('keydown', 'input', function(e) {
			e.which === 13 && !self.find('button[name="submit"]')[0].disabled && setTimeout(self.submit, 800);
		});
	};

	self.configure = function(key, value, init, prev) {
		if (init)
			return;
		switch (key) {
			case 'width':
				value !== prev && self.find(cls2).css('max-width', value + 'px');
				break;
			case 'closebutton':
				self.find(cls2 + '-button-close').tclass('hidden', value !== true);
				break;
		}
	};

	self.esc = function(bind) {
		if (bind) {
			if (!self.$esc) {
				self.$esc = true;
				$(W).on('keydown', self.esc_keydown);
			}
		} else {
			if (self.$esc) {
				self.$esc = false;
				$(W).off('keydown', self.esc_keydown);
			}
		}
	};

	self.esc_keydown = function(e) {
		if (e.which === 27 && !e.isPropagationStopped()) {
			var val = self.get();
			if (!val || config.if === val) {
				e.preventDefault();
				e.stopPropagation();
				self.hide();
			}
		}
	};

	self.hideforce = function() {
		if (!self.hclass('hidden')) {
			self.aclass('hidden');
			self.release(true);
			self.find(cls2).rclass(cls + '-animate');
			W.$$form_level--;
		}
	};

	var allowscrollbars = function() {
		$('html').tclass(cls + '-noscroll', !!$(cls2 + '-container').not('.hidden').length);
	};

	self.setter = function(value) {

		setTimeout2(self.name + '-noscroll', allowscrollbars, 50);

		var isHidden = value !== config.if;

		if (self.hclass('hidden') === isHidden) {
			if (!isHidden) {
				config.reload && self.EXEC(config.reload, self);
				config.default && DEFAULT(self.makepath(config.default), true);
			}
			return;
		}

		setTimeout2(cls, function() {
			EMIT('reflow', self.name);
		}, 10);

		if (isHidden) {
			if (!config.independent)
				self.hideforce();
			return;
		}

		if (self.template) {
			var is = self.template.COMPILABLE();
			self.find(cls2).append(self.template);
			self.template = null;
			is && COMPILE();
		}

		if (W.$$form_level < 1)
			W.$$form_level = 1;

		W.$$form_level++;

		self.css('z-index', W.$$form_level * config.zindex);
		self.element.scrollTop(0);
		self.rclass('hidden');

		self.resize();
		self.release(false);

		config.reload && self.EXEC(config.reload, self);
		config.default && DEFAULT(self.makepath(config.default), true);

		if (!isMOBILE && config.autofocus) {
			setTimeout(function() {
				self.find(typeof(config.autofocus) === 'string' ? config.autofocus : 'input[type="text"],select,textarea').eq(0).focus();
			}, 1000);
		}

		setTimeout(function() {
			self.rclass('invisible');
			self.element.scrollTop(0);
			self.find(cls2).aclass(cls + '-animate');
		}, 300);

		// Fixes a problem with freezing of scrolling in Chrome
		setTimeout2(self.ID, function() {
			self.css('z-index', (W.$$form_level * config.zindex) + 1);
		}, 500);

		config.closeesc && self.esc(true);
	};
});

COMPONENT('largeform', 'zindex:12;padding:30;scrollbar:1;scrolltop:1;style:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var csspos = {};
	var nav = false;
	var init = false;

	if (!W.$$largeform) {

		W.$$largeform_level = W.$$largeform_level || 1;
		W.$$largeform = true;

		$(document).on('click', cls2 + '-button-close', function() {
			SET($(this).attrd('path'), '');
		});

		var resize = function() {
			setTimeout2(self.name, function() {
				for (var i = 0; i < M.components.length; i++) {
					var com = M.components[i];
					if (com.name === 'largeform' && !HIDDEN(com.dom) && com.$ready && !com.$removed)
						com.resize();
				}
			}, 200);
		};

		ON('resize2', resize);

		$(document).on('click', cls2 + '-container', function(e) {

			if (e.target === this) {
				var com = $(this).component();
				if (com && com.config.closeoutside) {
					com.set('');
					return;
				}
			}

			var el = $(e.target);
			if (el.hclass(cls + '-container') && !el.hclass(cls + '-style-2')) {
				var form = el.find(cls2);
				var c = cls + '-animate-click';
				form.aclass(c);
				setTimeout(function() {
					form.rclass(c);
				}, 300);
			}
		});
	}

	self.readonly();
	self.submit = function() {
		if (config.submit)
			self.EXEC(config.submit, self.hide, self.element);
		else
			self.hide();
	};

	self.cancel = function() {
		config.cancel && self.EXEC(config.cancel, self.hide);
		self.hide();
	};

	self.hide = function() {
		if (config.independent)
			self.hideforce();
		self.esc(false);
		self.set('');
	};

	self.icon = function(value) {
		var el = this.rclass2('fa');
		value.icon && el.aclass(value.icon.indexOf(' ') === -1 ? ('fa fa-' + value.icon) : value.icon);
	};

	self.resize = function() {

		if (self.hclass('hidden'))
			return;

		var padding = isMOBILE ? 0 : config.padding;
		var ui = self.find(cls2);

		csspos.height = WH - (config.style == 1 ? (padding * 2) : padding);
		csspos.top = padding;
		ui.css(csspos);

		var el = self.find(cls2 + '-title');
		var th = el.height();
		csspos = { height: csspos.height - th, width: ui.width() };

		if (nav)
			csspos.height -= nav.height();

		self.find(cls2 + '-body').css(csspos);
		self.scrollbar && self.scrollbar.resize();
		self.element.SETTER('*', 'resize');
	};

	self.make = function() {

		$(document.body).append('<div id="{0}" class="hidden {4}-container invisible"><div class="{4}" style="max-width:{1}px"><div data-bind="@config__text span:value.title__change .{4}-icon:@icon" class="{4}-title"><button name="cancel" class="{4}-button-close{3}" data-path="{2}"><i class="fa fa-times"></i></button><i class="{4}-icon"></i><span></span></div><div class="{4}-body"></div></div>'.format(self.ID, config.width || 800, self.path, config.closebutton == false ? ' hidden' : '', cls));

		var scr = self.find('> script');
		self.template = scr.length ? scr.html().trim() : '';
		scr.length && scr.remove();

		var el = $('#' + self.ID);
		var body = el.find(cls2 + '-body')[0];

		while (self.dom.children.length) {
			var child = self.dom.children[0];
			if (child.tagName === 'NAV') {
				nav = $(child);
				body.parentNode.appendChild(child);
			} else
				body.appendChild(child);
		}

		self.rclass('hidden invisible');
		self.replace(el, true);

		if (config.scrollbar)
			self.scrollbar = SCROLLBAR(self.find(cls2 + '-body'), { visibleY: config.visibleY, orientation: 'y' });

		if (config.style === 2)
			self.aclass(cls + '-style-2');

		self.event('scroll', function() {
			EMIT('scroll', self.name);
			EMIT('reflow', self.name);
		});

		self.event('click', 'button[name]', function() {
			var t = this;
			switch (t.name) {
				case 'submit':
					self.submit(self.hide);
					break;
				case 'cancel':
					!t.disabled && self[t.name](self.hide);
					break;
			}
		});

		config.enter && self.event('keydown', 'input', function(e) {
			e.which === 13 && !self.find('button[name="submit"]')[0].disabled && setTimeout(self.submit, 800);
		});
	};

	self.configure = function(key, value, init, prev) {
		if (!init) {
			switch (key) {
				case 'width':
					value !== prev && self.find(cls2).css('max-width', value + 'px');
					break;
				case 'closebutton':
					self.find(cls2 + '-button-close').tclass('hidden', value !== true);
					break;
			}
		}
	};

	self.esc = function(bind) {
		if (bind) {
			if (!self.$esc) {
				self.$esc = true;
				$(W).on('keydown', self.esc_keydown);
			}
		} else {
			if (self.$esc) {
				self.$esc = false;
				$(W).off('keydown', self.esc_keydown);
			}
		}
	};

	self.esc_keydown = function(e) {
		if (e.which === 27 && !e.isPropagationStopped()) {
			var val = self.get();
			if (!val || config.if === val) {
				e.preventDefault();
				e.stopPropagation();
				self.hide();
			}
		}
	};

	self.hideforce = function() {
		if (!self.hclass('hidden')) {
			self.aclass('hidden');
			self.release(true);
			self.find(cls2).rclass(cls + '-animate');
			W.$$largeform_level--;
		}
	};

	var allowscrollbars = function() {
		$('html').tclass(cls + '-noscroll', !!$(cls2 + '-container').not('.hidden').length);
	};

	self.setter = function(value) {

		setTimeout2(self.name + '-noscroll', allowscrollbars, 50);

		var isHidden = value !== config.if;

		if (self.hclass('hidden') === isHidden) {
			if (!isHidden) {
				config.reload && self.EXEC(config.reload, self);
				config.default && DEFAULT(self.makepath(config.default), true);
				config.scrolltop && self.scrollbar && self.scrollbar.scrollTop(0);
			}
			return;
		}

		setTimeout2(cls, function() {
			EMIT('reflow', self.name);
		}, 10);

		if (isHidden) {
			if (!config.independent)
				self.hideforce();
			return;
		}

		if (self.template) {
			var is = self.template.COMPILABLE();
			self.find(cls2).append(self.template);
			self.template = null;
			is && COMPILE();
		}

		if (W.$$largeform_level < 1)
			W.$$largeform_level = 1;

		W.$$largeform_level++;

		self.css('z-index', W.$$largeform_level * config.zindex);
		self.rclass('hidden');

		self.release(false);
		config.scrolltop && self.scrollbar && self.scrollbar.scrollTop(0);

		config.reload && self.EXEC(config.reload, self);
		config.default && DEFAULT(self.makepath(config.default), true);

		if (!isMOBILE && config.autofocus) {
			setTimeout(function() {
				self.find(typeof(config.autofocus) === 'string' ? config.autofocus : 'input[type="text"],select,textarea').eq(0).focus();
			}, 1000);
		}

		self.resize();

		setTimeout(function() {
			self.rclass('invisible');
			self.find(cls2).aclass(cls + '-animate');
			if (!init && isMOBILE) {
				$('body').aclass('hidden');
				setTimeout(function() {
					$('body').rclass('hidden');
				}, 50);
			}
			init = true;
		}, 300);

		// Fixes a problem with freezing of scrolling in Chrome
		setTimeout2(self.ID, function() {
			self.css('z-index', (W.$$largeform_level * config.zindex) + 1);
		}, 500);

		config.closeesc && self.esc(true);
	};
});

COMPONENT('fullform', 'zindex:12;padding:20;scrollbar:1;scrolltop:1;style:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var csspos = {};
	var nav = false;
	var init = false;

	if (!W.$$fullform) {

		W.$$fullform_level = W.$$fullform_level || 1;
		W.$$fullform = true;

		$(document).on('click', cls2 + '-button-close', function() {
			SET($(this).attrd('path'), '');
		});

		var resize = function() {
			setTimeout2(self.name, function() {
				for (var i = 0; i < M.components.length; i++) {
					var com = M.components[i];
					if (com.name === 'fullform' && !HIDDEN(com.dom) && com.$ready && !com.$removed)
						com.resize();
				}
			}, 200);
		};

		ON('resize2', resize);

		$(document).on('click', cls2 + '-container', function(e) {

			if (e.target === this) {
				var com = $(this).component();
				if (com && com.config.closeoutside) {
					com.set('');
					return;
				}
			}

			var el = $(e.target);
			if (el.hclass(cls + '-container') && !el.hclass(cls + '-style-2')) {
				var form = el.find(cls2);
				var c = cls + '-animate-click';
				form.aclass(c);
				setTimeout(function() {
					form.rclass(c);
				}, 300);
			}
		});
	}

	self.readonly();
	self.submit = function() {
		if (config.submit)
			self.EXEC(config.submit, self.hide, self.element);
		else
			self.hide();
	};

	self.cancel = function() {
		config.cancel && self.EXEC(config.cancel, self.hide);
		self.hide();
	};

	self.hide = function() {
		if (config.independent)
			self.hideforce();
		self.esc(false);
		self.set('');
	};

	self.icon = function(value) {
		var el = this.rclass2('fa');
		value.icon && el.aclass(value.icon.indexOf(' ') === -1 ? ('fa fa-' + value.icon) : value.icon);
	};

	self.resize = function() {

		if (self.hclass('hidden'))
			return;

		var padding = isMOBILE ? 0 : config.style === 1 ? config.padding : 0;
		var ui = self.find(cls2);
		var p = (config.style == 1 ? (padding * 2) : 0);

		csspos.height = WH - (config.style == 1 ? (padding * 2) : padding);
		csspos.top = padding;
		ui.css(csspos);

		var el = self.find(cls2 + '-title');
		var th = el.height();

		csspos = { height: csspos.height - th, width: WW - p };

		if (nav)
			csspos.height -= nav.height();

		self.find(cls2 + '-body').css(csspos).parent().css({ width: WW - p });
		self.scrollbar && self.scrollbar.resize();
		self.element.SETTER('*', 'resize');
	};

	self.make = function() {

		$(document.body).append('<div id="{0}" class="hidden {4}-container invisible"><div class="{4}"><div data-bind="@config__text span:value.title__change .{4}-icon:@icon" class="{4}-title"><button name="cancel" class="{4}-button-close{3}" data-path="{2}"><i class="fa fa-times"></i></button><i class="{4}-icon"></i><span></span></div><div class="{4}-body"></div></div>'.format(self.ID, config.width || 800, self.path, config.closebutton == false ? ' hidden' : '', cls));

		var scr = self.find('> script');
		self.template = scr.length ? scr.html().trim() : '';
		scr.length && scr.remove();

		var el = $('#' + self.ID);
		var body = el.find(cls2 + '-body')[0];

		while (self.dom.children.length) {
			var child = self.dom.children[0];
			if (child.tagName === 'NAV') {
				nav = $(child);
				body.parentNode.appendChild(child);
			} else
				body.appendChild(child);
		}

		self.rclass('hidden invisible');
		self.replace(el, true);

		if (config.scrollbar)
			self.scrollbar = SCROLLBAR(self.find(cls2 + '-body'), { visibleY: config.visibleY, orientation: 'y' });

		if (config.style === 2)
			self.aclass(cls + '-style-2');

		self.event('scroll', function() {
			EMIT('scroll', self.name);
			EMIT('reflow', self.name);
		});

		self.event('click', 'button[name]', function() {
			var t = this;
			switch (t.name) {
				case 'submit':
					self.submit(self.hide);
					break;
				case 'cancel':
					!t.disabled && self[t.name](self.hide);
					break;
			}
		});

		config.enter && self.event('keydown', 'input', function(e) {
			e.which === 13 && !self.find('button[name="submit"]')[0].disabled && setTimeout(self.submit, 800);
		});
	};

	self.configure = function(key, value, init, prev) {
		if (!init) {
			switch (key) {
				case 'width':
					value !== prev && self.find(cls2).css('max-width', value + 'px');
					break;
				case 'closebutton':
					self.find(cls2 + '-button-close').tclass('hidden', value !== true);
					break;
			}
		}
	};

	self.esc = function(bind) {
		if (bind) {
			if (!self.$esc) {
				self.$esc = true;
				$(W).on('keydown', self.esc_keydown);
			}
		} else {
			if (self.$esc) {
				self.$esc = false;
				$(W).off('keydown', self.esc_keydown);
			}
		}
	};

	self.esc_keydown = function(e) {
		if (e.which === 27 && !e.isPropagationStopped()) {
			var val = self.get();
			if (!val || config.if === val) {
				e.preventDefault();
				e.stopPropagation();
				self.hide();
			}
		}
	};

	self.hideforce = function() {
		if (!self.hclass('hidden')) {
			self.aclass('hidden');
			self.release(true);
			self.find(cls2).rclass(cls + '-animate');
			W.$$fullform_level--;
		}
	};

	var allowscrollbars = function() {
		$('html').tclass(cls + '-noscroll', !!$(cls2 + '-container').not('.hidden').length);
	};

	self.setter = function(value) {

		setTimeout2(self.name + '-noscroll', allowscrollbars, 50);

		var isHidden = value !== config.if;

		if (self.hclass('hidden') === isHidden) {
			if (!isHidden) {
				config.reload && self.EXEC(config.reload, self);
				config.default && DEFAULT(self.makepath(config.default), true);
				config.scrolltop && self.scrollbar && self.scrollbar.scrollTop(0);
			}
			return;
		}

		setTimeout2(cls, function() {
			EMIT('reflow', self.name);
		}, 10);

		if (isHidden) {
			if (!config.independent)
				self.hideforce();
			return;
		}

		if (self.template) {
			var is = self.template.COMPILABLE();
			self.find(cls2).append(self.template);
			self.template = null;
			is && COMPILE();
		}

		if (W.$$fullform_level < 1)
			W.$$fullform_level = 1;

		W.$$fullform_level++;

		self.css('z-index', W.$$fullform_level * config.zindex);
		self.rclass('hidden');

		self.release(false);
		config.scrolltop && self.scrollbar && self.scrollbar.scrollTop(0);

		config.reload && self.EXEC(config.reload, self);
		config.default && DEFAULT(self.makepath(config.default), true);

		if (!isMOBILE && config.autofocus) {
			setTimeout(function() {
				self.find(typeof(config.autofocus) === 'string' ? config.autofocus : 'input[type="text"],select,textarea').eq(0).focus();
			}, 1000);
		}

		self.resize();

		setTimeout(function() {
			self.rclass('invisible');
			self.find(cls2).aclass(cls + '-animate');
			if (!init && isMOBILE) {
				$('body').aclass('hidden');
				setTimeout(function() {
					$('body').rclass('hidden');
				}, 50);
			}
			init = true;
		}, 300);

		// Fixes a problem with freezing of scrolling in Chrome
		setTimeout2(self.ID, function() {
			self.css('z-index', (W.$$fullform_level * config.zindex) + 1);
		}, 500);

		config.closeesc && self.esc(true);
	};
});

COMPONENT('miniform', 'zindex:12', function(self, config, cls) {

	var cls2 = '.' + cls;
	var csspos = {};

	if (!W.$$miniform) {

		W.$$miniform_level = W.$$miniform_level || 1;
		W.$$miniform = true;

		$(document).on('click', cls2 + '-button-close', function() {
			SET($(this).attrd('path'), '');
		});

		var resize = function() {
			setTimeout2(self.name, function() {
				for (var i = 0; i < M.components.length; i++) {
					var com = M.components[i];
					if (com.name === 'miniform' && !HIDDEN(com.dom) && com.$ready && !com.$removed)
						com.resize();
				}
			}, 200);
		};

		ON('resize2', resize);

		$(document).on('click', cls2 + '-container', function(e) {

			if (e.target === this) {
				var com = $(this).component();
				if (com && com.config.closeoutside) {
					com.set('');
					return;
				}
			}

			var el = $(e.target);

			if (el.hclass(cls + '-container-cell')) {
				var form = $(this).find(cls2);
				var c = cls + '-animate-click';
				form.aclass(c).rclass(c, 300);
				var com = el.parent().component();
				if (com && com.config.closeoutside)
					com.set('');
			}
		});
	}

	self.readonly();
	self.submit = function() {
		if (config.submit)
			self.EXEC(config.submit, self.hide, self.element);
		else
			self.hide();
	};

	self.cancel = function() {
		config.cancel && self.EXEC(config.cancel, self.hide);
		self.hide();
	};

	self.hide = function() {
		if (config.independent)
			self.hideforce();
		self.esc(false);
		self.set('');
	};

	self.esc = function(bind) {
		if (bind) {
			if (!self.$esc) {
				self.$esc = true;
				$(W).on('keydown', self.esc_keydown);
			}
		} else {
			if (self.$esc) {
				self.$esc = false;
				$(W).off('keydown', self.esc_keydown);
			}
		}
	};

	self.esc_keydown = function(e) {
		if (e.which === 27 && !e.isPropagationStopped()) {
			var val = self.get();
			if (!val || config.if === val) {
				e.preventDefault();
				e.stopPropagation();
				self.hide();
			}
		}
	};

	self.hideforce = function() {
		if (!self.hclass('hidden')) {
			self.aclass('hidden');
			self.release(true);
			self.find(cls2).rclass(cls + '-animate');
			W.$$miniform_level--;
		}
	};

	self.icon = function(value) {
		var el = this.rclass2('fa');
		value.icon && el.aclass(value.icon.indexOf(' ') === -1 ? ('fa fa-' + value.icon) : value.icon);
		this.tclass('hidden', !value.icon);
	};

	self.resize = function() {

		if (!config.center || self.hclass('hidden'))
			return;

		var ui = self.find(cls2);
		var fh = ui.innerHeight();
		var wh = WH;
		var r = (wh / 2) - (fh / 2);
		csspos.marginTop = (r > 30 ? (r - 15) : 20) + 'px';
		ui.css(csspos);
	};

	self.make = function() {

		$(document.body).append('<div id="{0}" class="hidden {4}-container invisible"><div class="{4}-container-table"><div class="{4}-container-cell"><div class="{4}" style="max-width:{1}px"><div data-bind="@config__text span:value.title__change .{4}-icon:@icon" class="{4}-title"><button name="cancel" class="{4}-button-close{3}" data-path="{2}"><i class="fa fa-times"></i></button><i class="{4}-icon"></i><span></span></div></div></div></div>'.format(self.ID, config.width || 800, self.path, config.closebutton == false ? ' hidden' : '', cls));

		var scr = self.find('> script');
		self.template = scr.length ? scr.html().trim() : '';
		if (scr.length)
			scr.remove();

		var el = $('#' + self.ID);
		var body = el.find(cls2)[0];

		while (self.dom.children.length)
			body.appendChild(self.dom.children[0]);

		self.rclass('hidden invisible');
		self.replace(el, true);

		self.event('scroll', function() {
			EMIT('scroll', self.name);
			EMIT('reflow', self.name);
		});

		self.event('click', 'button[name]', function() {
			var t = this;
			switch (t.name) {
				case 'submit':
					self.submit(self.hide);
					break;
				case 'cancel':
					!t.disabled && self[t.name](self.hide);
					break;
			}
		});

		config.enter && self.event('keydown', 'input', function(e) {
			e.which === 13 && !self.find('button[name="submit"]')[0].disabled && setTimeout(self.submit, 800);
		});
	};

	self.configure = function(key, value, init, prev) {
		if (!init) {
			switch (key) {
				case 'width':
					value !== prev && self.find(cls2).css('max-width', value + 'px');
					break;
				case 'closebutton':
					self.find(cls2 + '-button-close').tclass('hidden', value !== true);
					break;
			}
		}
	};

	self.setter = function(value) {

		setTimeout2(cls + '-noscroll', function() {
			$('html').tclass(cls + '-noscroll', !!$(cls2 + '-container').not('.hidden').length);
		}, 50);

		var isHidden = value !== config.if;

		if (self.hclass('hidden') === isHidden) {
			if (!isHidden) {
				config.reload && self.EXEC(config.reload, self);
				config.default && DEFAULT(self.makepath(config.default), true);
			}
			return;
		}

		setTimeout2(cls, function() {
			EMIT('reflow', self.name);
		}, 10);

		if (isHidden) {
			if (!config.independent)
				self.hideforce();
			return;
		}

		if (self.template) {
			var is = self.template.COMPILABLE();
			self.find(cls2).append(self.template);
			self.template = null;
			is && COMPILE();
		}

		if (W.$$miniform_level < 1)
			W.$$miniform_level = 1;

		W.$$miniform_level++;

		self.css('z-index', W.$$miniform_level * config.zindex);
		self.rclass('hidden');

		self.resize();
		self.release(false);

		config.reload && self.EXEC(config.reload, self);
		config.default && DEFAULT(self.makepath(config.default), true);

		if (!isMOBILE && config.autofocus) {
			setTimeout(function() {
				self.find(typeof(config.autofocus) === 'string' ? config.autofocus : 'input[type="text"],select,textarea').eq(0).focus();
			}, 1000);
		}

		setTimeout(function() {
			self.rclass('invisible');
			self.find(cls2).aclass(cls + '-animate');
		}, 300);

		// Fixes a problem with freezing of scrolling in Chrome
		setTimeout2(self.ID, function() {
			self.css('z-index', (W.$$miniform_level * config.zindex) + 1);
		}, 500);

		config.closeesc && self.esc(true);
	};
});

COMPONENT('detail', 'datetimeformat:yyyy-MM-dd HH:mm;dateformat:yyyy-MM-dd;timeformat:HH:mm;defaultgroup:Default', function(self, config, cls) {

	var cls2 = '.' + cls;
	var types = {};
	var container;
	var mapping;

	self.make = function() {

		self.aclass(cls + ' ' + cls + '-style-' + (config.style || 1) + (config.small ? (' ' + cls + '-small') : ''));

		var scr = self.find('script');
		if (scr.length) {
			mapping = (new Function('return ' + scr.html().trim()))();
			for (var i = 0; i < mapping.length; i++) {
				var item = mapping[i];
				if (item.show)
					item.show = FN(item.show);
			}
		}

		self.html('<div class="{0}-container"></div>'.format(cls));
		container = self.find(cls2 + '-container');

		var keys = Object.keys(types);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			types[key].init && types[key].init();
		}
	};

	self.nocompile();
	self.bindvisible();

	self.mapvalue = function(item) {
		var val = item.path ? item.path.indexOf('.') === -1 ? item.value[item.path] : GET(item.path, item.value) : item.value;
		return val === false || val === true ? val : val == null || val === '' ? (item.empty || DEF.empty) : val;
	};

	self.register = function(name, init, render) {
		types[name] = {};
		types[name].init = init;
		types[name].render = render;
		init(self);
	};

	types.template = {};
	types.template.init = NOOP;
	types.template.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-template">{1}</div>'.format(cls, Tangular.render(item.template, { value: value, item: item.value })));
	};

	types.string = {};
	types.string.init = NOOP;
	types.string.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-string">{1}</div>'.format(cls, Thelpers.encode(value)));
	};

	types.password = {};
	types.password.init = function() {
		self.event('click', cls2 + '-password', function() {
			var el = $(this);
			var html = el.html();

			if (html.substring(0, DEF.empty.length) === DEF.empty) {
				// no value
				return;
			}

			var tmp = el.attrd('value');
			el.attrd('value', html);
			el.html(tmp);
		});
	};
	types.password.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-password" data-value="{1}">{2}</div>'.format(cls, Thelpers.encode(value), value ? '************' : DEF.empty));
	};

	types.number = {};
	types.number.init = NOOP;
	types.number.render = function(item, next) {
		var value = self.mapvalue(item);
		var format = item.format || config.numberformat;
		value = format ? value.format(format) : value;
		next('<div class="{0}-number">{1}</div>'.format(cls, Thelpers.encode(value + '')));
	};

	types.date = {};
	types.date.init = NOOP;
	types.date.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-date">{1}</div>'.format(cls, value ? value.format(item.format || config.dateformat) : ''));
	};

	types.bool = {};
	types.bool.init = NOOP;
	types.bool.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-bool{1}"><span><i class="fa fa-check"></i></span></div>'.format(cls, value ? ' checked' : ''));
	};

	types.list = {};
	types.list.init = NOOP;
	types.list.render = function(item, next) {
		var value = self.mapvalue(item);
		var template = '<div class="{0}-list"><span>{1}</span></div>';
		if (item.detail) {
			AJAX('GET ' + item.detail.format(encodeURIComponent(value)), function(response) {
				next(template.format(cls, response[item.dirkey || 'name'] || item.placeholder || DEF.empty));
			});
		} else {
			var arr = typeof(item.items) === 'string' ? GET(item.items) : item.items;
			var m = (arr || EMPTYARRAY).findValue(item.dirvalue || 'id', value, item.dirkey || 'name', item.placeholder || DEF.empty);
			next(template.format(cls, m));
		}
	};

	types.color = {};
	types.color.init = NOOP;
	types.color.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-color"><span><b{1}>&nbsp;</b></span></div>'.format(cls, value ? (' style="background-color:' + value + '"') : ''));
	};

	types.fontawesome = {};
	types.fontawesome.init = NOOP;
	types.fontawesome.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-fontawesome"><i class="{1}"></i></div>'.format(cls, value || ''));
	};

	types.emoji = {};
	types.emoji.init = NOOP;
	types.emoji.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-emoji">{1}</div>'.format(cls, value || DEF.empty));
	};

	self.render = function(item, index) {
		var type = types[item.type === 'boolean' ? 'bool' : item.type];
		var c = cls;

		var meta = { label: item.label || item.name };

		if (item.icon) {
			var tmp = item.icon;
			if (tmp.indexOf(' ') === -1)
				tmp = 'fa fa-' + tmp;
			meta.icon = '<i class="{0}"></i>'.format(tmp);
		} else
			meta.icon = '';

		var el = $('<div class="{2}-item{3}" data-index="{1}"><div class="{0}-key">{{ icon }}{{ label }}</div><div class="{0}-value">&nbsp;</div></div>'.format(cls, index, c, item.required ? (' ' + cls + '-required') : '').arg(meta));
		type.render(item, function(html) {
			if (item.note)
				html += '<div class="{0}-note">{1}</div>'.format(cls, item.note);
			el.find(cls2 + '-value').html(html);
		});

		return el;
	};

	self.setter = function(value) {

		if (!value)
			value = EMPTYARRAY;

		var raw;

		if (mapping && value && value !== EMPTYARRAY) {
			raw = value;
			for (var i = 0; i < mapping.length; i++) {
				var m = mapping[i];
				m.value = raw;
			}
			value = mapping;
		}

		container.empty();

		var groups = {};

		for (var i = 0; i < value.length; i++) {
			var item = value[i];
			if (raw && item.show && !item.show(raw))
				continue;

			var g = item.group || config.defaultgroup;
			if (!groups[g])
				groups[g] = { html: [] };
			groups[g].html.push(self.render(item, i));
		}

		var keys = Object.keys(groups);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var group = groups[key];
			var hash = 'g' + HASH(key).toString(36);
			var el = $(('<div class="{0}-group' + (key.length > 1 ? '' : ' {0}-group-nolabel') + '" data-id="{2}">' + (key.length > 1 ? '<label>{1}</label>' : '') + '<section></section></div>').format(cls, key, hash));
			var section = el.find('section');
			for (var j = 0; j < group.html.length; j++)
				section.append(group.html[j]);
			container.append(el);
		}

	};

});