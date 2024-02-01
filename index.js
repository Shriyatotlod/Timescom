// const http = require('http');
// const https = require('https');
// const { parse } = require('url');
// const { createReadStream } = require('fs');
// const cheerio = require('cheerio');

// const server = http.createServer((req, res) => {
//     const { pathname } = parse(req.url);

//     if (pathname === '/') {
//         // Serve the HTML file when the root URL is accessed
//         serveStaticFile('index.html', res);
//     } else if (pathname === '/getTimeStories') {
//         handleGetTimeStories(req, res);
//     } else {
//         res.writeHead(404, { 'Content-Type': 'text/plain' });
//         res.end('Not Found');
//     }
// });

// const PORT = process.env.PORT || 3000;

// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

// function handleGetTimeStories(req, res) {
//     // Enable CORS by setting appropriate headers
//     res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust the origin as needed
//     res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

//     if (req.method === 'OPTIONS') {
//         // Preflight request, respond successfully
//         res.writeHead(200);
//         res.end();
//         return;
//     }

//     https.get('https://time.com', (response) => {
//         let data = '';

//         response.on('data', (chunk) => {
//             data += chunk;
//         });

//         response.on('end', () => {
//             const stories = parseHtml(data);
//             res.writeHead(200, { 'Content-Type': 'application/json' });
//             res.end(JSON.stringify(stories));
//         });
//     }).on('error', (error) => {
//         console.error('Error fetching data:', error);
//         res.writeHead(500, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ error: 'Internal Server Error' }));
//     });
// }


// // function parseHtml(html) {
// //     const $ = cheerio.load(html);
// //     const items = [];

// //     $('ul.tout__list.items.swipe-h li.item').each((index, element) => {
// //         const id = $(element).attr('id');
// //         const title = $(element).find('.tout__list-item-dek h3.headline').text().trim();
// //         const link = $(element).find('.tout__list-item-link').attr('href');
// //         const imageUrl = $(element).find('.image-container img').attr('src');

// //         items.push({ id, title, link, imageUrl });
// //     });

// //     return items;
// // }

// function parseHtml(html) {
//     const $ = cheerio.load(html);
//     const items = [];

//     $('ul li.latest-stories__item').each((index, element) => {
//         const title = $(element).find('h3.latest-stories__item-headline').text().trim();
//         const link = $(element).find('a').attr('href');
//         const timestamp = $(element).find('time.latest-stories__item-timestamp').text().trim();

//         items.push({ title, link, timestamp });
//     });

//     return items;
// }


// function serveStaticFile(fileName, res) {
//     const fileStream = createReadStream(fileName);
//     fileStream.pipe(res);
// }

const http = require('http');
const https = require('https');
const { parse } = require('url');
const { createReadStream } = require('fs');


const server = http.createServer((req, res) => {
    const { pathname } = parse(req.url);

    if (pathname === '/') {
        // Serve the HTML file when the root URL is accessed
        serveStaticFile('index.html', res);
    } else if (pathname === '/getTimeStories') {
        handleGetTimeStories(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT =  3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

function handleGetTimeStories(req, res) {
    // Enable CORS by setting appropriate headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust the origin as needed
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        // Preflight request, respond successfully
        res.writeHead(200);
        res.end();
        return;
    }

    https.get('https://time.com', (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const stories = parseHtml(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(stories));
        });
    }).on('error', (error) => {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
    });
}

function parseHtml(html) {
    const items = [];
    const startPattern = '<h3 class="latest-stories__item-headline">';
    const endPattern = '</li>';

    let startIndex = html.indexOf(startPattern);
    let endIndex;

    while (startIndex !== -1) {
        endIndex = html.indexOf(endPattern, startIndex);
        const storyHtml = html.substring(startIndex, endIndex + endPattern.length);
        const title = extractContent(storyHtml, '<h3 class="latest-stories__item-headline">', '</h3>');
        const link = extractAttribute(storyHtml, '<a', 'href="', '"');
        const timestamp = extractContent(storyHtml, '<time class="latest-stories__item-timestamp">', '</time>');

        items.push({ title, link, timestamp });
        startIndex = html.indexOf(startPattern, endIndex);
    }

    return items;
}

function extractContent(html, startTag, endTag) {
    const startIndex = html.indexOf(startTag) + startTag.length;
    const endIndex = html.indexOf(endTag, startIndex);
    return html.substring(startIndex, endIndex).trim();
}

function extractAttribute(html, tag, attribute, endChar) {
    const startIndex = html.indexOf(tag);
    const attributeIndex = html.indexOf(attribute, startIndex) + attribute.length;
    const endIndex = html.indexOf(endChar, attributeIndex);
    return html.substring(attributeIndex, endIndex);
}

function serveStaticFile(fileName, res) {
    const fileStream = createReadStream(fileName);
    fileStream.pipe(res);
}
