/*
 * 비채리더스포럼 데이터 로더
 * data/ 폴더의 JSON 파일을 읽어 페이지에 렌더링합니다.
 *
 * 사용법:
 *   메인 페이지: loadPrograms('main'), loadReviews('main')
 *   서브 페이지: loadPrograms('sub'), loadReviews('sub'), loadFaqs(), loadNotices()
 *   페이지 텍스트: loadPageText('pages/home.json', callback)
 *   푸터: loadSiteData()
 */

// 경로 자동 판별 (메인 vs pages 하위 vs admin)
var DATA_BASE = (location.pathname.indexOf('/pages/') !== -1) ? '../data/' :
                (location.pathname.indexOf('/admin/') !== -1) ? '../data/' : 'data/';
var PAGES_BASE = (location.pathname.indexOf('/pages/') !== -1) ? '' : 'pages/';

// 이미지 경로 변환: CMS 절대경로(/assets/...)를 사이트 상대경로로 변환
function resolveImg(path) {
    if (!path) return '';
    var clean = path.replace(/^\//, '');
    if (location.pathname.indexOf('/pages/') !== -1) return '../' + clean;
    return clean;
}

function fetchJSON(filename) {
    return fetch(DATA_BASE + filename + '?v=' + Date.now()).then(function(r) {
        if (!r.ok) throw new Error(filename + ' load failed: ' + r.status);
        return r.json();
    }).then(function(data) {
        // CMS 호환: { items: [...] } 래퍼 또는 순수 배열 모두 지원
        if (Array.isArray(data)) return data;
        if (data.items && Array.isArray(data.items)) return data.items;
        return data;
    }).catch(function(e) {
        console.error('[data-loader]', e);
        return [];
    });
}

// JSON 파일 원본 그대로 로드 (배열 변환 없이)
function fetchJSONRaw(filename) {
    return fetch(DATA_BASE + filename + '?v=' + Date.now()).then(function(r) {
        if (!r.ok) throw new Error(filename + ' load failed: ' + r.status);
        return r.json();
    }).catch(function(e) {
        console.warn('[data-loader]', filename, e);
        return null;
    });
}

// ========================================
// 페이지 텍스트 로딩
// ========================================
function loadPageText(jsonFile, callback) {
    return fetchJSONRaw(jsonFile).then(function(data) {
        if (data && callback) callback(data);
        return data;
    });
}

// 텍스트를 HTML로 변환 (\n → <br>)
function textToHtml(text) {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
}

// ID로 요소 찾아서 텍스트 세팅
function setText(id, text) {
    var el = document.getElementById(id);
    if (el && text !== undefined && text !== null) {
        el.innerHTML = textToHtml(text);
    }
}

// ========================================
// 사이트 공통 데이터 (푸터)
// ========================================
function loadSiteData() {
    return fetchJSONRaw('site.json').then(function(data) {
        if (!data || !data.footer) return;
        var f = data.footer;
        // 푸터 슬로건
        var sloganEls = document.querySelectorAll('[data-cms="footer-slogan"]');
        sloganEls.forEach(function(el) { el.textContent = f.slogan; });
        // 전화번호
        var telEls = document.querySelectorAll('[data-cms="footer-tel"]');
        telEls.forEach(function(el) { el.textContent = 'Tel. ' + f.tel; });
        // 주소
        var addrEls = document.querySelectorAll('[data-cms="footer-address"]');
        addrEls.forEach(function(el) { el.textContent = f.address; });
        // 회사정보
        var infoEls = document.querySelectorAll('[data-cms="footer-info"]');
        infoEls.forEach(function(el) { el.textContent = f.companyInfo; });
        // 저작권
        var copyEls = document.querySelectorAll('[data-cms="footer-copyright"]');
        copyEls.forEach(function(el) { el.innerHTML = '&copy; ' + f.copyright.replace(/^©\s*/, ''); });
    });
}

// ========================================
// 프로그램 렌더링
// ========================================
function loadPrograms(mode) {
    return fetchJSON('programs.json').then(function(data) {
        if (mode === 'main') {
            renderProgramsMain(data);
        } else if (mode === 'sub') {
            renderProgramsSub(data);
        } else if (mode === 'grid') {
            renderProgramsGrid(data);
        }
    });
}

function renderProgramsMain(data) {
    var container = document.querySelector('.program-list');
    if (!container) return;
    var html = '';
    data.forEach(function(p) {
        var badgeClass = p.statusType ? ' ' + p.statusType : '';
        var btnClass = p.btnOutline ? ' outline' : '';
        var link = PAGES_BASE + p.btnLink.replace('pages/', '');
        html += '<div class="program-item">';
        html += '<div class="program-date">';
        html += '<span class="month">' + p.month + '</span>';
        html += '<span class="day">' + p.day + '</span>';
        html += '<span class="year">' + p.year + '</span>';
        html += '</div>';
        html += '<div class="program-info">';
        html += '<span class="program-badge' + badgeClass + '">' + p.status + '</span>';
        html += '<h3>' + p.title + '</h3>';
        html += '<p class="program-meta">';
        html += '<span' + (p.meta1Temp ? ' class="temp-data"' : '') + '>' + p.meta1 + '</span>';
        html += '<span' + (p.meta2Temp ? ' class="temp-data"' : '') + '>' + p.meta2 + '</span>';
        html += '</p>';
        html += '</div>';
        html += '<a href="' + link + '" class="program-btn' + btnClass + '">' + p.btnText + '</a>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function renderProgramsSub(data) {
    var container = document.querySelector('.program-list');
    if (!container) return;
    var html = '';
    data.forEach(function(p) {
        var badgeClass = p.statusType ? ' ' + p.statusType : '';
        var btnClass = p.btnOutline ? ' outline' : '';
        var link = p.btnLink.replace('pages/', '');
        html += '<div class="program-item">';
        html += '<div class="program-date">';
        html += '<span class="month">' + p.month + '</span>';
        html += '<span class="day">' + p.day + '</span>';
        html += '<span class="year">' + p.year + '</span>';
        html += '</div>';
        html += '<div class="program-info">';
        html += '<span class="program-badge' + badgeClass + '">' + p.status + '</span>';
        html += '<h3>' + p.title + '</h3>';
        html += '<p class="program-meta">';
        html += '<span' + (p.meta1Temp ? ' class="temp-data"' : '') + '>' + p.meta1 + '</span>';
        html += '<span' + (p.meta2Temp ? ' class="temp-data"' : '') + '>' + p.meta2 + '</span>';
        html += '</p>';
        html += '</div>';
        html += '<a href="' + link + '" class="program-btn' + btnClass + '">' + p.btnText + '</a>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function renderProgramsGrid(data) {
    var container = document.querySelector('.program-grid');
    if (!container) return;
    var statusMap = { '': 'open', 'upcoming': 'preparing', 'closed': 'closed' };
    var html = '';
    data.forEach(function(p) {
        var badgeClass = statusMap[p.statusType] || 'preparing';
        var link = p.detailLink ? p.detailLink.replace('pages/', '') : '#';
        html += '<div class="program-box">';
        html += '<span class="program-box-badge ' + badgeClass + '">' + p.status + '</span>';
        html += '<h3>' + p.title + '</h3>';
        html += '<p>' + (p.desc || '') + '</p>';
        html += '<a href="' + link + '" class="program-box-btn">상세보기</a>';
        html += '</div>';
    });
    container.innerHTML = html;
}

// ========================================
// 프로그램 상세 페이지 CTA 동적 표시
// ========================================
function loadProgramCta(programTitle) {
    return fetchJSON('programs.json').then(function(data) {
        var ctaArea = document.querySelector('.cta-area');
        if (!ctaArea) return;
        var found = data.find(function(p) { return p.title === programTitle; });
        if (found && found.status === '모집중') {
            ctaArea.style.display = '';
        } else {
            ctaArea.style.display = 'none';
        }
    });
}

// ========================================
// 리뷰 렌더링
// ========================================
function loadReviews(mode) {
    return fetchJSON('reviews.json').then(function(data) {
        if (mode === 'main') {
            renderReviewsMain(data);
        } else if (mode === 'sub') {
            renderReviewsSub(data);
        }
    });
}

function renderReviewsMain(data) {
    var container = document.querySelector('.review-cards');
    if (!container) return;
    var items = data.slice(0, 3);
    var html = '';
    items.forEach(function(r) {
        html += '<div class="review-card">';
        if (r.thumbImage) {
            html += '<div class="review-thumb"><img src="' + resolveImg(r.thumbImage) + '" alt="' + r.title + '" style="width:100%;height:100%;object-fit:cover;"></div>';
        } else {
            html += '<div class="review-thumb">' + (r.thumb || '') + '</div>';
        }
        if (r.category) html += '<span class="review-category">' + r.category + '</span>';
        html += '<h4>' + r.title + '</h4>';
        html += '<p>' + (r.desc || '') + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function renderReviewsSub(data) {
    var container = document.getElementById('reviewList');
    if (!container) return;
    var html = '';
    data.forEach(function(r) {
        html += '<div class="review-item" data-aos="fade-up">';
        if (r.thumbImage) {
            html += '<div class="review-thumb"><img src="' + resolveImg(r.thumbImage) + '" alt="' + r.title + '" style="width:100%;height:100%;object-fit:cover;"></div>';
        } else {
            html += '<div class="review-thumb">' + (r.thumb || '') + '</div>';
        }
        html += '<div class="review-body">';
        if (r.category) html += '<span class="review-category">' + r.category + '</span>';
        html += '<h4>' + r.title + '</h4>';
        html += '<p>' + (r.desc || '').replace(/\n/g, '<br>') + '</p>';
        if (r.contact) html += '<p class="review-contact">' + r.contact + '</p>';
        html += '</div>';
        html += '</div>';
    });
    container.innerHTML = html;
}

// ========================================
// FAQ 렌더링
// ========================================
function loadFaqs() {
    fetchJSON('faqs.json').then(function(data) {
        var container = document.querySelector('.faq-list');
        if (!container) return;
        var html = '';
        data.forEach(function(f) {
            html += '<div class="faq-item">';
            html += '<div class="faq-q"><span>' + f.question + '</span><span class="icon">+</span></div>';
            html += '<div class="faq-a"><div class="faq-a-inner">' + f.answer + '</div></div>';
            html += '</div>';
        });
        container.innerHTML = html;
        // FAQ 토글 이벤트 바인딩
        container.querySelectorAll('.faq-q').forEach(function(q) {
            q.addEventListener('click', function() {
                q.parentElement.classList.toggle('open');
            });
        });
    });
}

// ========================================
// 공지사항 렌더링
// ========================================
function loadNotices() {
    fetchJSON('notices.json').then(function(data) {
        var tbody = document.querySelector('.notice-table tbody');
        var detailContainer = document.getElementById('noticeDetailContainer');
        if (!tbody) return;

        // 최신순 정렬 (번호 큰 순 → 날짜 최신순)
        data.sort(function(a, b) { return b.id - a.id; });

        var tbodyHtml = '';
        var detailHtml = '';
        data.forEach(function(n, i) {
            tbodyHtml += '<tr class="notice-row" data-id="' + n.id + '" style="cursor: pointer;">';
            tbodyHtml += '<td style="text-align: center;">' + n.id + '</td>';
            tbodyHtml += '<td><span class="notice-title-link">' + n.title + '</span></td>';
            tbodyHtml += '<td style="text-align: center;">' + n.date + '</td>';
            tbodyHtml += '</tr>';

            detailHtml += '<div class="notice-detail" id="noticeDetail-' + n.id + '">';
            detailHtml += '<h3>' + n.title + '</h3>';
            detailHtml += '<p class="notice-meta">작성일: ' + n.date + '</p>';
            detailHtml += '<div class="notice-detail-body">' + n.body + '</div>';
            detailHtml += '</div>';
        });
        tbody.innerHTML = tbodyHtml;
        if (detailContainer) detailContainer.innerHTML = detailHtml;

        // 클릭 토글 이벤트
        tbody.querySelectorAll('.notice-row').forEach(function(row) {
            row.addEventListener('click', function() {
                var id = row.getAttribute('data-id');
                var detail = document.getElementById('noticeDetail-' + id);
                if (detail) {
                    document.querySelectorAll('.notice-detail.show').forEach(function(d) {
                        if (d !== detail) d.classList.remove('show');
                    });
                    detail.classList.toggle('show');
                }
            });
        });
    });
}

// ========================================
// 프로그램 상세 페이지 동적 렌더링
// ========================================
function loadProgramPage(jsonFile) {
    return loadPageText(jsonFile, function(data) {
        // 배너
        if (data.banner) {
            setText('pageBannerTitle', data.banner.title);
            setText('pageBannerDesc', data.banner.desc);
        }
        // 섹션
        if (data.sections) {
            data.sections.forEach(function(sec, i) {
                var prefix = 'section' + i;
                setText(prefix + 'Label', sec.label);
                setText(prefix + 'Heading', sec.heading);
                if (sec.body) setText(prefix + 'Body', sec.body);
                // 테이블
                if (sec.table) {
                    var tableEl = document.getElementById(prefix + 'Table');
                    if (tableEl) {
                        var thtml = '';
                        sec.table.forEach(function(row) {
                            thtml += '<tr><th>' + row.th + '</th><td>' + row.td + '</td></tr>';
                        });
                        tableEl.innerHTML = thtml;
                    }
                }
                // 리스트
                if (sec.list) {
                    var listEl = document.getElementById(prefix + 'List');
                    if (listEl) {
                        var lhtml = '';
                        sec.list.forEach(function(item) {
                            if (item.desc) {
                                lhtml += '<li><strong>' + item.title + '</strong> - ' + item.desc + '</li>';
                            } else {
                                lhtml += '<li>' + item.title + '</li>';
                            }
                        });
                        listEl.innerHTML = lhtml;
                    }
                }
                // 참고 문구
                if (sec.note !== undefined) {
                    setText(prefix + 'Note', sec.note);
                }
            });
        }
    });
}

// ========================================
// Apply 선택지 프로그램 동적 생성
// ========================================
function loadProgramOptions() {
    return fetchJSON('programs.json').then(function(data) {
        var select = document.getElementById('program');
        if (!select) return;
        // 기존 옵션 중 첫 번째(placeholder)만 남기고 제거
        while (select.options.length > 1) {
            select.remove(1);
        }
        data.forEach(function(p) {
            var opt = document.createElement('option');
            opt.value = p.title;
            opt.textContent = p.title;
            select.appendChild(opt);
        });
    });
}
