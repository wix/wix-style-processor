import * as Color from 'color';
import {expect} from 'chai';
import {IndexDriver} from './index.driver';
import {hash} from './hash';

describe('Index', () => {
    let driver: IndexDriver;

    beforeEach(() => {
        driver = new IndexDriver();

        driver
            .given.css('.foo { --bar: "color(color-4)"; color: "color(--bar)"}')
            .given.defaultSiteColors()
            .given.styleParams({
            numbers: {},
            colors: {},
            fonts: {}
        })
            .given.siteTextPresets({});
    });

    it('should update on init', () => {
        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg()).to.equal('.foo{--bar: #717070;color: #717070;}');
        });
    });

    it('should support colors from settings', () => {
        const css = '.foo {color: "color(--my_var)";}';
        driver
            .given.css(css)
            .given.styleParams({
            colors: {
                my_var: {value: 'red'}
            }
        });

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to.equal('.foo{color: rgb(255, 0, 0);}');
            });
    });

    it('should support fonts from settings', () => {
        const css = '.foo {font: "font(--my_var)";}';
        driver
            .given.css(css)
            .given.styleParams({
            fonts: {
                my_var: {
                    value: `font-family:'mr de haviland','cursive';`,
                    index: 93,
                    cssFontFamily: `'mr de haviland','cursive'`,
                    family: 'mr de haviland',
                    fontParam: true,
                    size: 0,
                    style: {
                        bold: false,
                        italic: false,
                        underline: false
                    }
                }
            }
        });

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to
                    .equal(`.foo{font: normal normal normal 17px/1.4em mr de haviland,cursive;text-decoration: ;}`);
            });
    });

    it('should support font string hack from settings', () => {
        const css = '.foo {width: "string(--my_var)";}';

        driver
            .given.css(css)
            .given.styleParams({
            fonts: {
                my_var: {
                    value: '100px',
                    fontStyleParam: false
                }
            }
        });

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{width: 100px;}`);
            });
    });

    it('should support string default value', () => {
        const css = '.foo {--my_var: "string(0px)"; width: "string(--my_var)";}';
        driver
            .given.css(css)
            .given.styleParams({
            numbers: {},
            colors: {},
            fonts: {}
        })
            .given.siteTextPresets({});

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{--my_var: 0px;width: 0px;}`);
            });
    });

    it('should support default values', () => {
        const css = ':root{--my_var3: "color(color-4)";} .foo {color: "color(--my_var3)";}';
        driver
            .given.css(css)
            .given.styleParams({
            numbers: {},
            colors: {
                my_var3: {value: 'rgba(128,110,66,0.6193647540983607)'}
            },
            fonts: {}
        })
            .given.siteTextPresets({});

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to
                    .equal(':root{--my_var3: #717070;}.foo{color: rgba(128, 110, 66, 0.6193647540983607);}');
            });
    });

    it('should work with declarations with no semicolon at the end', () => {
        const css = `:root {
--cart_textFontStyle:"font(Body-M)";
--cartButton_textColor:"color(color-1)"}
.foo{font:"font(--cart_textFontStyle)";color:"color(--cartButton_textColor)"}`;

        driver
            .given.css(css)
            .given.styleParams({
            colors: {
                my_var2: {value: 'rgba(128,110,66,0.6193647540983607)'}
            }
        })
            .given.siteTextPresets({
            'Body-M': {
                editorKey: 'font_8',
                fontFamily: 'raleway',
                lineHeight: '1.4em',
                size: '17px',
                style: 'normal',
                value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
                weight: 'normal'
            }
        });

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to
                    .equal(`:root{--cart_textFontStyle: normal normal normal 17px/1.4em raleway,sans-serif;--cartButton_textColor: #FFFFFF;}.foo{font: normal normal normal 17px/1.4em raleway,sans-serif;text-decoration: ;color: #FFFFFF;}`);
            });
    });

    it('should not fail on present with none normal font-variant', () => {
        const css = '.font-test{font: "font(Body-M)";}';
        driver.given.css(css)
            .given.siteTextPresets({
            'Body-M': {
                editorKey: 'font_8',
                fontFamily: 'din-next-w01-light',
                lineHeight: '1.4em',
                size: '16px',
                style: 'normal',
                value: 'font:normal small-caps normal 12px/1.2em play,sans-serif;',
                weight: 'normal'
            }
        });

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg())
                    .to
                    .equal('.font-test{font: normal normal normal 12px/1.2em play,sans-serif;}');
            });
    });

    it('should support double font reference', () => {
        const css = '.font-test{--some-font: "font(Body-M)"; font: "font(--some-font)";}';
        driver.given.css(css)
            .given.siteTextPresets({
            'Body-M': {
                displayName: 'Paragraph 2',
                editorKey: 'font_8',
                fontFamily: 'din-next-w01-light',
                lineHeight: '1.4em',
                size: '16px',
                style: 'normal',
                value: 'font:normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif',
                weight: 'normal'
            }
        });

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg())
                    .to
                    .equal('.font-test{--some-font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;text-decoration: ;}');
            });
    });

    it('should not calculate empty strings', () => {
        const css = '.font-test:after{content: " ";}';
        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.font-test:after{content: " ";}');
        });
    });

    it('should calculate nested functions', () => {
        const css = '.font-test{--var: "color(color-2)"; color:"join(opacity(color(color-1), 0.5), 1, opacity(--var, 0.5), 1)"}';
        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.font-test{--var: #F3F3F3;color: rgba(255, 255, 255, 0.5);}');
        });
    });

    it('should calculate nested functions with multiple functions params', () => {
        const css = '.font-test{--var: "color(color-2)"; color:"fallback(join(opacity(color(color-1), 0.5), 1, opacity(--var, 0.5), 1), color(color-8))"}';
        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.font-test{--var: #F3F3F3;color: rgba(255, 255, 255, 0.5);}');
        });
    });

    it('should handle nested font', () => {
        const css = '.font-var-fallback {--var: "font(Body-M)"; font: "fallback(font(--var))";}';
        driver.given.css(css)
            .given.siteTextPresets({
            'Body-M': {
                editorKey: 'font_8',
                fontFamily: 'raleway',
                lineHeight: '1.4em',
                size: '17px',
                style: 'normal',
                value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
                weight: 'normal'
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.font-var-fallback{--var: normal normal normal 17px/1.4em raleway,sans-serif;font: normal normal normal 17px/1.4em raleway,sans-serif;text-decoration: ;}');
        });
    });

    it('opacity with default value', () => {
        const css = '.foo { rule1: "opacity(--lala, 0.5)"; --lala: "color(color-9)"}';
        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.foo{rule1: rgba(255, 0, 0, 0.5);--lala: #FF0000;}');
        });
    });

    it('color transformation', () => {
        const css = `.foo { rule: bar; rule3: baz; rule4: "color(color-1)"; rule5: "color(color(color(color-2)))"; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.foo{rule: bar;rule3: baz;rule4: #FFFFFF;rule5: #F3F3F3;}');
        });
    });

    it('darken transformation', () => {
        const css = `.foo { rule1: "darken(color(color-9), 0.5)"; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule1: rgb(128, 0, 0);}`);
        });
    });

    it('without opacity', () => {
        const css = `.foo { rule1: "withoutOpacity(opacity(color(color-9), 0.1))"; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule1: rgb(255, 0, 0);}`);
        });
    });

    it('composed opacity with custom var', () => {
        const css = `.foo { rule1: "opacity(--foo, 0.5)"; }`;

        driver.given.css(css)
            .given.styleParams({
            colors: {
                foo: {value: '#FFFF00'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule1: rgba(255, 255, 0, 0.5);}`);
        });
    });

    it('join', () => {
        const css = `.foo { rule1: "join(--foo, 1, color(color-10), 1)"; }`;

        driver.given.css(css)
            .given.styleParams({
            colors: {
                foo: {value: '#FF0000'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule1: rgb(255, 255, 0);}`);
        });
    });

    it('should support number', () => {
        const css = `.foo { width: calc(100% - "number(--foo)"); }`;

        driver.given.css(css)
            .given.styleParams({
            numbers: {
                foo: 42
            },
            colors: {
                bar: {value: '#FF0000'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{width: calc(100% - 42);}`);
        });
    });

    it('should support unit', () => {
        let css = `.foo { border: "unit(--foo, px)" solid "color(--bar)"; }`;

        driver.given.css(css)
            .given.styleParams({
            numbers: {
                foo: 42
            },
            colors: {
                bar: {value: '#FF0000'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{border: 42px solid #FF0000;}`);
        });
    });

    it('should support unit with value 0', () => {
        let css = `.foo { border: "unit(--foo, px)" solid "color(--bar)"; }`;

        driver.given.css(css)
            .given.styleParams({
            numbers: {
                foo: 0
            },
            colors: {
                bar: {value: '#FF0000'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{border: 0px solid #FF0000;}`);
        });
    });

    it('does not modify static params', () => {
        const css = `.foo { padding: 10px 11px 12px 13px; margin-right: 20px; color: blue; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{padding: 10px 11px 12px 13px;margin-right: 20px;color: blue;}`);
        });
    });

    it('does not modify regular css vars', () => {
        const css = `.foo { --bar: var(42); --baz: var(21); padding: --baz;}`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{--bar: var(42);--baz: var(21);padding: --baz;}`);
        });
    });

    it('should work with pseudo selectors', () => {
        const css = `.datepicker__day--highlighted:hover{ background-color: #32be3f;}`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.datepicker__day--highlighted:hover{background-color: #32be3f;}`);
        });
    });

    it('should detect declarations with no space after the :', () => {
        const css = `.foo { rule: bar; rule3:baz; rule4:"color(color-9)"; rule5:"color(color(color-9))" }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule: bar;rule3: baz;rule4: #FF0000;rule5: #FF0000;}`);
        });
    });

    it('should support font theme override', () => {
        const css = `.foo{ font: "font({theme: 'Body-M', size: '10px', lineHeight: '2em', weight: 'bold', style:'italic'})"}`;

        driver.given.css(css)
            .given.siteTextPresets({
            'Body-M': {
                editorKey: 'font_8',
                fontFamily: 'raleway',
                lineHeight: '1.4em',
                size: '17px',
                style: 'normal',
                value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
                weight: 'normal'
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{font: italic normal bold 10px/2em raleway,sans-serif;}`);
        });
    });

    it('should support font override with var from settings', () => {
        const css = `.foo{ --bodyText: "font({theme: 'Body-M', size: '10px', lineHeight: '2em', weight: 'bold', style:'italic'})"; font: "font(--bodyText)"}`;

        driver.given.css(css)
            .given.siteTextPresets({
            'Body-M': {
                editorKey: 'font_8',
                fontFamily: 'raleway',
                lineHeight: '1.4em',
                size: '17px',
                style: 'normal',
                value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
                weight: 'normal'
            }
        })
            .given.styleParams({
            fonts: {
                bodyText: {
                    value: `font-family:'mr de haviland','cursive';`,
                    index: 93,
                    cssFontFamily: `'mr de haviland','cursive'`,
                    family: 'mr de haviland',
                    fontParam: true,
                    size: 0,
                    style: {
                        bold: false,
                        italic: false,
                        underline: false
                    }
                }
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to
                .equal(`.foo{--bodyText: italic normal bold 10px/2em raleway,sans-serif;font: normal normal normal 17px/1.4em mr de haviland,cursive;text-decoration: ;}`);
        });
    });

    it('should support font override with var', () => {
        const css = `.foo{ --bodyText: "font({theme: 'Body-M', size: '10px', lineHeight: '2em', weight: 'bold', style:'italic'})"; font: "font(--bodyText)"}`;

        driver.given.css(css)
            .given.siteTextPresets({
            'Body-M': {
                editorKey: 'font_8',
                fontFamily: 'raleway',
                lineHeight: '1.4em',
                size: '17px',
                style: 'normal',
                value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
                weight: 'normal'
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to
                .equal(`.foo{--bodyText: italic normal bold 10px/2em raleway,sans-serif;font: italic normal bold 10px/2em raleway,sans-serif;text-decoration: ;}`);
        });
    });

    it('should support double var reference', () => {
        const css = `.foo { --var1: "number(42)"; --var2: "number(--var1)"; rule4:"number(--var2)"; }`;

        driver.given.css(css)
            .given.styleParams({numbers: {var1: 1}});

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{--var1: 42;--var2: 1;rule4: 1;}`);
        });
    });

    it('has declaration plugin support', () => {
        const css = `.foo {bar: 4;}`;

        driver.given.css(css)
            .given.declarationReplacerPlugin((key, val) => ({
            key: 'ZzZ' + key + 'ZzZ',
            value: '#' + val + '#'
        }));

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg()).to.equal('.foo{ZzZbarZzZ: #4#;}');
        });
    });

    it('should support external css functions', () => {
        let css = `.foo { --var1: "increment(1)"; border-radius: "unit(--var1, px)" }`;

        driver.given.css(css)
            .given.cssFunctionPlugin('increment', (value) => 1 + +value);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{--var1: 2;border-radius: 2px;}`);
        });
    });

    [
        '"opacity(color(color-1, 0.5)"',
        `"fallback(font({theme: 'Body-M'), font(Body-M))"`,
        '"join(darken(opacity(color(color-1, 1)), 1, color(color-1), 1)"'
    ].forEach((decl) => {
        it('should throw on unbalanced parenthesis', () => {
            const css = `.font-test{color: ${decl}}`;
            driver.given.css(css);

            return driver.when.init()
                .then(() => {throw new Error('was not supposed to succeed')})
                .catch((e) => {
                    expect(e.toString()).to.contain('contains unbalanced parenthesis');
                });
        });
    });

    it('should not fail on undefined var for font', () => {
        let css = `.foo { --var1: "font(--var)" }`;

        driver.given.css(css);
        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{--var1: undefined;}`);
        });
    });

    it('should support underline', () => {
        let css = `.foo { font: "font(--fontVar)" }`;

        driver.given.css(css)
            .given.styleParams({
            fonts: {
                fontVar: {
                    value: `font-family:'mr de haviland','cursive';`,
                    index: 93,
                    cssFontFamily: `'mr de haviland','cursive'`,
                    family: 'mr de haviland',
                    fontParam: true,
                    size: 0,
                    style: {
                        bold: false,
                        italic: false,
                        underline: true
                    }
                }
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to
                .equal(`.foo{font: normal normal normal 17px/1.4em mr de haviland,cursive;text-decoration: underline;}`);
        });
    });

    describe('calculate css function', () => {
        it('should return native calc function with the numbers concatenated with the operator', () => {
            const css = '.foo {padding: 0 "calculate(+, unit(2, px), unit(number(--var1), px))";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {var1: 1},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{padding: 0 calc(2px + 1px);}');
                });
        });

        it('should return the first number if only one number was given', () => {
            const css = '.foo {padding: 0 "calculate(-, unit(2, px))";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{padding: 0 2px;}');
                });
        });

        it('should support nested calculate', () => {
            const css = '.foo {padding: 0 "calculate(+, unit(2, px), unit(number(--var1), px), calculate(-, unit(number(--var2), px), 8px))";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {var1: 1, var2: 3},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{padding: 0 calc(2px + 1px + calc(3px - 8px));}');
                });
        });
    });

    describe('fallback css function', () => {
        it('should return the first none falsy value', () => {
            const css = '.foo {color: "fallback(color(--my_var3), color(color-1))";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{color: #FFFFFF;}');
                });
        });

        it('should return first none falsy value', () => {
            const css = '.foo {--my_var3: red; color: "fallback(color(--my_var3), color(color-1))";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{--my_var3: red;color: rgb(255, 0, 0);}');
                });
        });

        it('should support multiple values', () => {
            const css = '.foo {color: "fallback(--my_var2, --my_var3, color(color-1))";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{color: #FFFFFF;}');
                });
        });

        it('should support 0 as true', () => {
            const css = '.foo {border-width: "unit(fallback(zeroAsTrue(--borderWidth), number(1)), string(px))";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {borderWidth: 0},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{border-width: 0px;}');
                });
        });

        it('should ignore undefined as true', () => {
            const css = '.foo {border-width: "unit(fallback(zeroAsTrue(--borderWidth), number(1)), string(px))";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{border-width: 1px;}');
                });
        });
    });

    describe('zeroAsTrue css function', () => {
        it('should return 0', () => {
            const css = '.foo {border-width: "zeroAsTrue(--borderWidth)";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {borderWidth: 0},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{border-width: 0;}');
                });
        });

        it('should return undefined', () => {
            const css = '.foo {border-width: "zeroAsTrue(--borderWidth)";}';
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{border-width: undefined;}');
                });
        });
    });

    describe('smartBGContrast css function', () => {
        const textColor = 'hsl(196, 57%, 39%)'; // some kind of blue
        const goodLightBgColor = new Color(textColor).lightness(99).rgb().string(); // 'hsl(196, 57, 99)';
        const goodDarkBgColor = new Color(textColor).lightness(0).rgb().string(); // 'hsl(196, 57, 0)';
        const badLightBgColor = 'hsl(196, 57%, 60%)'; // brighter than textColor
        const badDarkBgColor = 'hsl(196, 57%, 35%)'; // darker than textColor
        const fallbackForBadLightColor = new Color(badLightBgColor).lightness(100).rgb().string();
        const fallbackForBadDarkColor = new Color(badDarkBgColor).lightness(0).rgb().string();

        it('should return darkened color when contrast to low', () => {
            const css = `.foo {background-color: "smartBGContrast(${textColor}, ${badDarkBgColor})";}`;
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{background-color: ${fallbackForBadDarkColor};}`);
                });
        });

        it('should return lightened color when contrast to low', () => {
            const css = `.foo {background-color: "smartBGContrast(${textColor}, ${badLightBgColor})";}`;
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{background-color: ${fallbackForBadLightColor};}`);
                });
        });

        it('should return same color when good contrast (dark background)', () => {
            const css = `.foo {background-color: "smartBGContrast(${textColor}, ${goodDarkBgColor})";}`;
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{background-color: ${goodDarkBgColor};}`);
                });
        });

        it('should return same color when good contrast (light background)', () => {
            const css = `.foo {background-color: "smartBGContrast(${textColor}, ${goodLightBgColor})";}`;
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{background-color: ${goodLightBgColor};}`);
                });
        });
    });

    describe('readableFallback', () => {
        const baseColor = 'white';
        const goodSuggestionColor = '#333333';
        const fallbackColor = 'black';
        const badSuggestionColor = 'yellow';

        it('should return suggested color if base and suggestion colors are readable together', () => {
            const css = `.foo {color: "readableFallback(${baseColor}, ${goodSuggestionColor}, ${fallbackColor})";}`;
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{color: ${goodSuggestionColor};}`);
                });
        });

        it('should return fallback color if base and suggestion colors are not readable together', () => {
            const css = `.foo {color: "readableFallback(${baseColor}, ${badSuggestionColor}, ${fallbackColor})";}`;
            driver
                .given.css(css)
                .given.styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
                .given.siteTextPresets({});

            return driver.when.init()
                .then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{color: ${fallbackColor};}`);
                });
        });
    });

    describe('As Standalone', () => {
        beforeEach(() => {
            const css = `.foo {bar: 4; color: "color(color-1)"}`;

            driver
                .given.css(css)
                .given.styleParams(null)
                .given.siteTextPresets(null)
                .given.resetSiteColors()
                .given.declarationReplacerPlugin((key, val) => ({
                key,
                value: '#' + val + '#'
            }));
        });

        describe('withoutStyleCapabilites', () => {
            it('should not apply css functions', () => {
                driver.given.withoutWixStyles();
                return driver.when.init().then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{bar: #4#;color: #"color(color-1)"#;}');
                });
            });
        });

        describe('inStandaloneMode', () => {
            beforeEach(() => {
                driver.given.inStandaloneMode();
            });

            it('should finish init', () => {
                return driver.when.init().then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{bar: #4#;color: #"color(color-1)"#;}');
                });
            });

            it('should not apply css functions', () => {
                return driver.when.init().then(() => {
                    expect(driver.get.overrideStyleCallArg()).to.equal('.foo{bar: #4#;color: #"color(color-1)"#;}');
                });
            });
        });
    });

    describe('In Editor', () => {
        beforeEach(() => {
            driver.given.inEditorMode();
        });

        it('should update style on style change event', () => {
            const css = `.foo { --bar: "color(color-4)"; color: "color(--bar)"}`;

            driver.given.css(css);

            return driver.when.init()
                .then(() => {
                    driver.given.styleParams({
                        colors: {
                            bar: {value: '#ffffff'}
                        }
                    });
                })
                .then(driver.when.updateStyleParams)
                .then(() => {
                    expect(driver.get.overrideStyleCallArg(1)).to.equal('.foo{--bar: #717070;color: #ffffff;}');
                });
        });

        describe('Enhanced mode', () => {
            const color = '"join(darken(color(color-9), 0.5), 0.5, color(color-10), 0.5)"';
            const borderWidth = '"unit(number(--borderWidth), string(px))"';
            const borderColor = '"withoutOpacity(opacity(color(color-1), 0.5))"';
            const font = `"font({theme: 'Body-M', size: '30px'})"`;
            const fontVar = `--fontVar`;
            const fontWithUnderline = `"font(${fontVar})"`;
            const underline = `"underline(${fontVar})"`;

            beforeEach(() => {
                driver.given.cssVarsSupported(true)
                    .given
                    .css(`.foo {color: ${color}; border: ${borderWidth} solid ${borderColor}; font: ${font}; font: ${fontWithUnderline}`)
                    .given.styleParams({
                    numbers: {borderWidth: 42},
                    fonts: {
                        fontVar: {
                            value: `font-family:'mr de haviland','cursive';`,
                            index: 93,
                            cssFontFamily: `'mr de haviland','cursive'`,
                            family: 'mr de haviland',
                            fontParam: true,
                            size: 0,
                            style: {
                                bold: false,
                                italic: false,
                                underline: true
                            }
                        }
                    }
                })
                    .given.siteTextPresets({
                    'Body-M': {
                        editorKey: 'font_8',
                        fontFamily: 'raleway',
                        lineHeight: '1.4em',
                        size: '17px',
                        style: 'normal',
                        value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
                        weight: 'normal'
                    }
                });
            });

            it('should change custom syntax to native vars', () => {
                return driver.when.init()
                    .then(() => expect(driver.get.overrideStyleCallArg()).to
                        .equal(`.foo{color: var(--${hash(color)});border: var(--${hash(borderWidth)}) solid var(--${hash(borderColor)});font: var(--${hash(font)});font: var(--${hash(fontWithUnderline)});text-decoration: var(--${hash(underline)});}`));
            });

            it('should evaluate custom functions on style update', () => {
                const newValues = {
                    number: 42,
                    color: '#000000'
                };
                return driver.when.init()
                    .then(() => {
                        driver.given.siteColor('color-1', newValues.color)
                            .given.siteColor('color-9', '#0000FF');
                    })
                    .then(driver.when.updateStyleParams)
                    .then(() => {
                        expect(driver.get.updateCssVarsCallArg(1)).to
                            .eql({
                                [`--${hash(color)}`]: 'rgb(0, 255, 128)',
                                [`--${hash(borderWidth)}`]: `${newValues.number}px`,
                                [`--${hash(borderColor)}`]: 'rgb(0, 0, 0)',
                                [`--${hash(font)}`]: 'normal normal normal 30px/1.4em raleway,sans-serif',
                                [`--${hash(fontWithUnderline)}`]: 'normal normal normal 17px/1.4em mr de haviland,cursive',
                                [`--${hash(underline)}`]: 'underline'
                            });
                    });
            });

            it('should allow to override shouldUseCssVars by options', () => {
                return driver
                    .when.init({shouldUseCssVars: false})
                    .then(() => expect(driver.get.overrideStyleCallArg()).to
                        .equal(`.foo{color: rgb(128, 255, 0);border: 42px solid rgb(255, 255, 255);font: normal normal normal 30px/1.4em raleway,sans-serif;font: normal normal normal 17px/1.4em mr de haviland,cursive;text-decoration: underline;}`));
            });
        });
    });
});
