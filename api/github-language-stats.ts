import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { of } from 'rxjs';
import { concatMap, mergeMap, tap, filter, pluck, reduce, map } from 'rxjs/operators';
import colors from '../colors.json';

export default (request: VercelRequest, response: VercelResponse) => {
    const { username = 'navneetlal' } = request.query;
    of(`https://api.github.com/users/navneetlal/repos`)
        .pipe(
            concatMap(url => fetch(url).then(res => res.json())),
            concatMap(list => list),
            filter((repo: any) => !repo.fork),
            pluck('languages_url'),
            mergeMap((url: string) => fetch(url).then(res => res.json())),
            filter(lang => !(Object.keys(lang).length === 0 && lang.constructor === Object)),
            reduce((acc, curr) => acc.concat([curr]), [] as any[]),
            map(x => {
                const languages: Record<string, any> = {}
                const langInRepos = [
                    { 'C#': 7823 },
                    { HCL: 345 },
                    { TypeScript: 6502, Shell: 217 },
                    { HTML: 11870, JavaScript: 8338 },
                    { JavaScript: 4441 },
                    { 'C#': 4598 },
                    { JavaScript: 6260, CSS: 1395, HTML: 499 },
                    { 'C#': 3540 },
                    { Dockerfile: 1132 },
                    { 'C#': 11916 },
                    { TypeScript: 5762, Dockerfile: 295 },
                    { 'C#': 1347, Shell: 137 },
                    { JavaScript: 2326 },
                    { CSS: 48630, HTML: 12520, JavaScript: 2055, Ruby: 157 },
                    { TypeScript: 7174, HTML: 1721, CSS: 930 },
                    { Java: 631 }
                ] as Record<string, any>[]
                langInRepos.forEach(langInRepo => {
                    for (const lang in langInRepo) {
                        if (Object.prototype.hasOwnProperty.call(languages, lang)) languages[lang] = languages[lang] + langInRepo[lang]
                        else languages[lang] = langInRepo[lang]
                    }
                })
                return { languages, total: Object.values(languages).reduce((acc, current) => acc + current, 0) }
            }),
            map(x => {
                let l = []
                for (const lang in x.languages) {
                    l.push({
                        name: lang,
                        color: colors[lang as keyof typeof colors].color || "#CCCCCC",
                        size: ((x.languages[lang] / x.total) * 100).toFixed(2)
                    })
                }
                l.sort(function (a, b) {
                    return parseInt(b.size) - parseInt(a.size);
                });
                return l.slice(0, 6);
            }),
            map(a => {
                let x = 0;
                let y = 0
                const rect = a.map((b: any) => {
                    let width = 300 * parseFloat(b.size) / 100
                    const r = `<rect mask="url(#rect-mask)" data-testid="lang-progress" x="${x.toFixed(2)}" y="${y}" width="${width.toFixed(2)}" height="8" fill="${b.color}" />`
                    x = x + width;
                    return r;
                })

                let translateX = 0
                let translateY = 0
                const g = a.map((b: any, i: number) => {
                    if (i % 2 === 0) {
                        translateX = 0;
                        translateY = translateY + 25
                    }
                    else translateX = 150
                    return `<g transform="translate(${translateX}, ${translateY})">
                    <circle cx="5" cy="6" r="5" fill="${b.color}" />
                    <text data-testid="lang-name" x="15" y="10" class='lang-name'>
                    ${b.name} ${b.size}%
                    </text>
                    </g>`

                })
                return `<svg width="350" height="165" viewBox="0 0 350 165" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <style>
                    .header {
                        font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
                        fill: #2f80ed;
                        animation: fadeInAnimation 0.8s ease-in-out forwards;
                    }
                    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333 }
            
                    
                /* Animations */
                @keyframes scaleInAnimation {
                from {
                    transform: translate(-5px, 5px) scale(0);
                }
                to {
                    transform: translate(-5px, 5px) scale(1);
                }
                }
                @keyframes fadeInAnimation {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
                }
            
                    * { animation-duration: 0s !important; animation-delay: 0s !important; }
                </style>
            
            
            
                <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="349" fill="#fffefe" stroke-opacity="1" />
            
            
                <g data-testid="card-title" transform="translate(25, 35)">
                    <g transform="translate(0, 0)">
                        <text x="0" y="0" class="header" data-testid="header">Most Used Languages</text>
                    </g>
                </g>
            
            
                <g data-testid="main-card-body" transform="translate(0, 55)">
            
                    <svg data-testid="lang-items" x="25">
            
                        <mask id="rect-mask">
                            <rect x="0" y="0" width="300" height="8" fill="white" rx="5" />
                        </mask>
            
                        ${rect.join(' ')}
            
            
                        ${g.join(' ')}
            
            
                    </svg>
            
                </g>
            </svg>
            `

            }),
        ).subscribe({
            next: (result) => response.status(200).send(result),
            error: (err) => response.status(500).send(err)
        })
};