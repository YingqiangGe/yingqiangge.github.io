#!/usr/bin/env python3
"""Generate the JSON CV from this site's English Markdown CV and site config."""

import argparse
import json
import re
from pathlib import Path

import yaml


def parse_markdown_cv(path):
    content = Path(path).read_text(encoding="utf-8")
    english = re.search(r'<div\b[^>]*data-i18n="en"[^>]*>(.*?)</div>', content, re.S)
    if not english:
        raise ValueError("The CV must contain an English data-i18n block")
    content = english.group(1)
    headings = list(re.finditer(r'^([^\n]+)\n=+\s*$', content, re.M))
    return {
        match.group(1).strip(): content[match.end():headings[i + 1].start() if i + 1 < len(headings) else len(content)].strip()
        for i, match in enumerate(headings)
    }


def entries(section):
    """Keep nested bullets attached to their top-level entry."""
    return [item.strip() for item in re.split(r'^\* ', section, flags=re.M)[1:]]


def plain_text(text):
    return re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)


def parse_education(section):
    result = []
    for item in entries(section):
        match = re.fullmatch(r'(.+?), (.+?), (\d{4})\s*-\s*(\d{4})', item)
        if not match:
            raise ValueError(f"Unrecognized education entry: {item}")
        degree, institution, start, end = match.groups()
        result.append({"institution": institution, "area": degree, "startDate": start, "endDate": end})
    return result


def parse_work_experience(section):
    result = []
    for item in entries(section):
        lines = item.splitlines()
        company, location = lines[0].split(', ', 1)
        role = re.fullmatch(r'\s*\* (.+?),\s+(.+?)\s+-\s+(.+)', lines[1])
        if not role:
            raise ValueError(f"Unrecognized work entry: {item}")
        position, start, end = role.groups()
        result.append({
            "company": company, "location": location, "position": position,
            "startDate": start, "endDate": end,
            "highlights": [plain_text(re.sub(r'^\* ', '', line.strip())) for line in lines[2:] if line.strip()],
        })
    return result


def create_cv_json(md_file, config_file, output_file):
    sections = parse_markdown_cv(md_file)
    with Path(config_file).open(encoding="utf-8") as file:
        config = yaml.safe_load(file)
    author = config['author']
    profiles = []
    for key, network, prefix in [
        ('googlescholar', 'Google Scholar', ''),
        ('github', 'GitHub', 'https://github.com/'),
        ('linkedin', 'LinkedIn', 'https://www.linkedin.com/in/'),
    ]:
        if author.get(key):
            profiles.append({"network": network, "url": prefix + author[key]})
    data = {
        "basics": {
            "name": author.get('name') or config['name'],
            "email": author.get('email', ''), "website": config['url'],
            "summary": author.get('bio', ''),
            "location": {"city": author.get('location', '')},
            "profiles": profiles,
        },
        "education": parse_education(sections['Education']),
        "work": parse_work_experience(sections['Experience']),
        "service": [plain_text(item) for item in entries(sections['Service and leadership'])],
        "awards": entries(sections['Awards']),
    }
    # Template collections contain sample data. Only the maintained CV is used.
    Path(output_file).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding="utf-8")
    print(f"Updated {output_file}")


def main():
    root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', '-i', type=Path, default=root / '_pages/cv.md')
    parser.add_argument('--output', '-o', type=Path, default=root / '_data/cv.json')
    parser.add_argument('--config', '-c', type=Path, default=root / '_config.yml')
    args = parser.parse_args()
    create_cv_json(args.input, args.config, args.output)


if __name__ == '__main__':
    main()
