const helper = require("../app/service/helper");

test('default options', () =>{

    const res = helper.defaultOptions();
    expect(typeof res[0]).toBe('string');
});


test('regex test', () =>{
    const img1 = "https://scontent.fmaa12-3.fna.fbcdn.net/v/t1.6435-1/135837012_10158073564499506_5869992588585673208_n.jpg?stp=dst-jpg_p200x200&_nc_cat=1&ccb=1-7&_nc_sid=dbb9e7&_nc_ohc=sO94n3HHhYcAX-L1fuU&_nc_ht=scontent.fmaa12-3.fna&oh=00_AT-ciYj0PObR_ENbuqa4sObubuHMNM6FHNmK67uKEpnclw&oe=63176D41"
    const og1 = "og:title"

    const img2 = "https://google.com";
    const og2 = "og"
    
    const res = helper.regex();

    expect(res['img'].test(img1)).toBe(true);
    expect(res['og'].test(og1)).toBe(true);

    expect(res['img'].test(img2)).toBe(false);
    expect(res['og'].test(og2)).toBe(false);
});


