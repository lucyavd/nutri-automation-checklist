# Nutri Automation Checklist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [x]) syntax for tracking.

**Goal:** Deliver a separate seven-question checklist for nutrition experts, with individualized results and CTA to contact via two messengers.

**Architecture:** Independent Vite React app copied from universal checklist (only source/config), new question and recommendation domain module, existing visual components redesigned around the approved copy. Host on a new subpath via Caddy handle_path with a separate static root.

**Tech Stack:** React 18, TS, Tailwind, Vite, Caddy, Playwright.

**Spec:** docs/superpowers/specs/2026-11-17-nutri-checklist-design.md

## Tasks
### 1. Scaffolding and tests
- [x] Create new independent project with copied dependency/config files; exclude .git and .env.
- [x] Write tests for seven questions, scoring, prioritized main result, secondary results and no-issues branch.
- [x] Watch tests fail on original source.

### 2. Domain content and calculation
- [x] Replace diagnostic module with seven approved questions and five result categories.
- [x] Map each answer onto manual/partial/none without over-diagnosing.
- [x] Expose primary and optional secondaries and an all-good result, check tests.

### 3. UX and CTA
- [x] Update title, intro, question wizard, result, and intro «Привет, меня зовут Люда».
- [x] Preserve history/back, copy results, links, and clipboard fallback.
- [x] Ensure no data collection on the site.
- [x] Test build/lint/typecheck.

### 4. Deployment and verification
- [x] Build server project at /opt/checklists/nutri-automation (don't modify originals).
- [x] Add Caddy route without overwriting existing live sites; validate config, save backup.
- [x] Test URL on mobile and desktop including all answers, copy, zero-issues, and combined cases.
- [x] Check original checklists still work, verify PC/server source and Git status.

## Результат исполнения и ограничение
- Серверная сборка, lint, typecheck и unit tests пройдены.
- Browser QA на /nutri/: 320px, 390px, 1366px, пять одиночных результатов, многопризнаковая комбинация, копирование, ответ без проблем.
- Регрессионные проверки универсальных чек-листов пройдены после обновления маршрутов.
- Системный Caddyfile доступен только для чтения. Новый маршрут применён командой caddy reload --config /opt/checklists/nutri-automation/Caddyfile.candidate. При системном рестарте Caddy следует проверять наличие маршрута и при необходимости повторять reload сохранённой конфигурации.
- GitHub-репозиторий для нового проекта пока не создан, исходники хранятся в отдельном Git-репозитории на компьютере и на сервере.
