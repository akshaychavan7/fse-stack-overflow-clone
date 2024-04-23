const sanitizeParams = require('../middleware/sanitizeParams');

describe('sanitizeParams middleware', () => {
  test('should sanitize request body and call next', () => {
    let req, res, next;
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    req.body = {
      username: '<script>alert("XSS attack!")</script>',
      email: 'malicious@example.com',
      bio: '<img src="invalid-image.jpg" onerror="alert(\'XSS attack!\')"> Click me!',
    };

    sanitizeParams(req, res, next);

    expect(req.body).toEqual({
      username: "&lt;script&gt;alert(&quot;XSS attack!&quot;)&lt;/script&gt;",
      email: 'malicious@example.com',
      bio: "&lt;img src=&quot;invalid-image.jpg&quot; onerror=&quot;alert(&#39;XSS attack!&#39;)&quot;&gt; Click me!",
      isProfane: false,
    });
    expect(next).toHaveBeenCalled();
  });

  test('should sanitize request body and call next and assign true flag for profane', () => {
    let req, res, next;
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    req.body = {
      username: '<script>alert("XSS attack!")</script>',
      email: 'malicious@example.com',
      bio: '<img src="invalid-image.jpg" onerror="alert(\'XSS attack!\')"> Click me! ASS',
    };

    sanitizeParams(req, res, next);

    expect(req.body).toEqual({
      username: "&lt;script&gt;alert(&quot;XSS attack!&quot;)&lt;/script&gt;",
      email: 'malicious@example.com',
      bio: "&lt;img src=&quot;invalid-image.jpg&quot; onerror=&quot;alert(&#39;XSS attack!&#39;)&quot;&gt; Click me! ASS",
      isProfane: true,
    });
    expect(next).toHaveBeenCalled();
  });
});