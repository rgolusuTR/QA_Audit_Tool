#!/usr/bin/env python3
"""
Python-based extraction for page properties and Eloqua forms
Uses BeautifulSoup for accurate HTML parsing
"""

import sys
import json
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def extract_page_properties(html_content, base_url):
    """Extract w-* page properties using Python BeautifulSoup"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # w-page-type extraction
    page_type = "Not Available"
    
    # Check for meta tags first
    page_type_meta = soup.find('meta', attrs={'name': 'w-page-type'}) or soup.find('meta', attrs={'property': 'w-page-type'})
    if page_type_meta:
        page_type = page_type_meta.get('content', 'Not Available')
    else:
        # Intelligent detection
        if soup.find('article'):
            page_type = "Article"
        elif soup.find('form'):
            page_type = "Form Page"
        elif 'blog' in base_url or 'news' in base_url:
            page_type = "Blog Post"
        elif base_url.endswith('/') or base_url.endswith('/index.html'):
            page_type = "Homepage"
        elif 'contact' in base_url:
            page_type = "Contact Page"
        elif 'about' in base_url:
            page_type = "About Page"
        else:
            page_type = "Standard Page"
    
    # w-published-date extraction
    published_date = "Not Available"
    date_selectors = [
        {'name': 'w-published-date'},
        {'property': 'w-published-date'},
        {'name': 'published-date'},
        {'property': 'article:published_time'},
        {'name': 'date'},
        {'name': 'publish-date'}
    ]
    
    for selector in date_selectors:
        meta_tag = soup.find('meta', attrs=selector)
        if meta_tag:
            published_date = meta_tag.get('content', 'Not Available')
            if published_date != 'Not Available':
                break
    
    # Check time elements
    if published_date == "Not Available":
        time_tag = soup.find('time', attrs={'datetime': True})
        if time_tag:
            published_date = time_tag.get('datetime', 'Not Available')
    
    # w-business-unit extraction
    business_unit = "Not Available"
    business_selectors = [
        {'name': 'w-business-unit'},
        {'property': 'w-business-unit'},
        {'name': 'business-unit'},
        {'name': 'department'},
        {'name': 'division'}
    ]
    
    for selector in business_selectors:
        meta_tag = soup.find('meta', attrs=selector)
        if meta_tag:
            business_unit = meta_tag.get('content', 'Not Available')
            if business_unit != 'Not Available':
                break
    
    # w-sector extraction
    sector = "Not Available"
    sector_selectors = [
        {'name': 'w-sector'},
        {'property': 'w-sector'},
        {'name': 'sector'},
        {'name': 'industry'},
        {'name': 'category'}
    ]
    
    for selector in sector_selectors:
        meta_tag = soup.find('meta', attrs=selector)
        if meta_tag:
            sector = meta_tag.get('content', 'Not Available')
            if sector != 'Not Available':
                break
    
    # w-discipline extraction
    discipline = "Not Available"
    discipline_selectors = [
        {'name': 'w-discipline'},
        {'property': 'w-discipline'},
        {'name': 'discipline'},
        {'name': 'subject'},
        {'name': 'topic'}
    ]
    
    for selector in discipline_selectors:
        meta_tag = soup.find('meta', attrs=selector)
        if meta_tag:
            discipline = meta_tag.get('content', 'Not Available')
            if discipline != 'Not Available':
                break
    
    # w-thumbnail-image extraction
    thumbnail_image = "Not Available"
    thumbnail_selectors = [
        {'name': 'w-thumbnail-image'},
        {'property': 'w-thumbnail-image'},
        {'property': 'og:image'},
        {'name': 'twitter:image'},
        {'name': 'thumbnail'}
    ]
    
    for selector in thumbnail_selectors:
        meta_tag = soup.find('meta', attrs=selector)
        if meta_tag:
            thumbnail_image = meta_tag.get('content', 'Not Available')
            if thumbnail_image != 'Not Available':
                # Convert relative URLs to absolute
                if not thumbnail_image.startswith('http'):
                    thumbnail_image = urljoin(base_url, thumbnail_image)
                break
    
    # w-read-time calculation
    text_content = soup.get_text()
    word_count = len(text_content.split())
    read_time_minutes = max(1, word_count // 200)  # 200 words per minute
    w_read_time = f"{read_time_minutes} min read"
    
    return {
        'w_page_type': page_type,
        'w_published_date': published_date,
        'w_business_unit': business_unit,
        'w_sector': sector,
        'w_discipline': discipline,
        'w_thumbnail_image': thumbnail_image,
        'w_read_time': w_read_time
    }

def extract_eloqua_forms(html_content, base_url):
    """Extract Eloqua forms using Python BeautifulSoup"""
    soup = BeautifulSoup(html_content, 'html.parser')
    eloqua_forms = []
    form_index = 0
    
    # Method 1: Search for forms with Eloqua attributes
    eloqua_selectors = [
        {'data-form-name': True},
        {'data-elq-id': True},
        {'elq-form-id': True},
        {'eloqua-id': True}
    ]
    
    # Find forms with any Eloqua attributes
    all_forms = soup.find_all('form')
    for form in all_forms:
        has_eloqua = False
        
        # Check if form has any Eloqua attributes
        eloqua_attrs = ['data-form-name', 'data-elq-id', 'elq-form-id', 'eloqua-id', 'elq-id']
        for attr in eloqua_attrs:
            if form.get(attr):
                has_eloqua = True
                break
        
        # Also check for Eloqua class names
        form_classes = form.get('class', [])
        if isinstance(form_classes, str):
            form_classes = form_classes.split()
        
        if any('eloqua' in cls.lower() or 'elq' in cls.lower() for cls in form_classes):
            has_eloqua = True
        
        if has_eloqua:
            form_index += 1
            
            # Extract all Eloqua attributes
            data_form_name = (
                form.get('data-form-name') or
                form.get('elq-form-name') or
                form.get('eloqua-form-name') or
                form.get('name') or
                "Not Available"
            )
            
            data_elq_id = (
                form.get('data-elq-id') or
                form.get('elq-form-id') or
                form.get('eloqua-id') or
                form.get('elq-id') or
                "Not Available"
            )
            
            data_redirect_page = (
                form.get('data-redirect-page') or
                form.get('elq-redirect') or
                form.get('eloqua-redirect') or
                form.get('action') or
                "Not Available"
            )
            
            data_analytics_name = (
                form.get('data-analytics-name') or
                form.get('elq-analytics') or
                form.get('eloqua-analytics') or
                form.get('data-track-name') or
                "Not Available"
            )
            
            data_endpoint = (
                form.get('action') or
                form.get('data-endpoint') or
                form.get('elq-endpoint') or
                "Not Available"
            )
            
            # Extract all hidden fields
            hidden_fields = []
            hidden_inputs = form.find_all('input', {'type': 'hidden'})
            for hidden_input in hidden_inputs:
                field_name = hidden_input.get('name', '')
                field_value = hidden_input.get('value', '')
                
                if field_name:
                    hidden_fields.append({
                        'name': field_name,
                        'value': field_value,
                        'element': str(hidden_input)
                    })
            
            eloqua_form = {
                'form_index': form_index,
                'data_form_name': data_form_name,
                'data_elq_id': data_elq_id,
                'data_redirect_page': data_redirect_page,
                'data_analytics_name': data_analytics_name,
                'data_endpoint': data_endpoint,
                'form_html': str(form)[:1000] + '...' if len(str(form)) > 1000 else str(form),
                'hidden_fields': hidden_fields
            }
            
            eloqua_forms.append(eloqua_form)
    
    # Method 2: Search for elements with Eloqua data attributes (not just forms)
    eloqua_elements = soup.find_all(attrs={'data-elq-id': True})
    eloqua_elements.extend(soup.find_all(attrs={'elq-form-id': True}))
    eloqua_elements.extend(soup.find_all(attrs={'eloqua-id': True}))
    
    for element in eloqua_elements:
        # Skip if we already processed this as a form
        if element.name == 'form':
            continue
            
        form_index += 1
        
        data_form_name = (
            element.get('data-form-name') or
            element.get('elq-form-name') or
            element.get('eloqua-form-name') or
            "Element with Eloqua ID"
        )
        
        data_elq_id = (
            element.get('data-elq-id') or
            element.get('elq-form-id') or
            element.get('eloqua-id') or
            "Not Available"
        )
        
        eloqua_form = {
            'form_index': form_index,
            'data_form_name': data_form_name,
            'data_elq_id': data_elq_id,
            'data_redirect_page': "Not Available",
            'data_analytics_name': "Not Available",
            'data_endpoint': "Not Available",
            'form_html': str(element)[:500] + '...' if len(str(element)) > 500 else str(element),
            'hidden_fields': []
        }
        
        eloqua_forms.append(eloqua_form)
    
    # Method 3: Search JavaScript for Eloqua configurations
    script_tags = soup.find_all('script')
    for script in script_tags:
        script_content = script.get_text()
        if 'eloqua' in script_content.lower() or 'elq' in script_content.lower():
            form_index += 1
            
            # Extract configuration from JavaScript using regex
            form_name_match = re.search(r'(?:elqFormName|eloquaFormName|formName)["\']?\s*:\s*["\']([^"\']+)["\']', script_content, re.IGNORECASE)
            elq_id_match = re.search(r'(?:elq-?id|eloqua-?id|elqId)["\']?\s*:\s*["\']([^"\']+)["\']', script_content, re.IGNORECASE)
            redirect_match = re.search(r'(?:redirect|elqRedirect)["\']?\s*:\s*["\']([^"\']+)["\']', script_content, re.IGNORECASE)
            analytics_match = re.search(r'(?:analytics|elqAnalytics|trackingName)["\']?\s*:\s*["\']([^"\']+)["\']', script_content, re.IGNORECASE)
            
            eloqua_form = {
                'form_index': form_index,
                'data_form_name': form_name_match.group(1) if form_name_match else 'JavaScript Configuration',
                'data_elq_id': elq_id_match.group(1) if elq_id_match else 'JavaScript Based',
                'data_redirect_page': redirect_match.group(1) if redirect_match else "Not Available",
                'data_analytics_name': analytics_match.group(1) if analytics_match else 'JavaScript Tracking',
                'data_endpoint': "Not Available",
                'form_html': script_content[:500] + '...' if len(script_content) > 500 else script_content,
                'hidden_fields': []
            }
            
            eloqua_forms.append(eloqua_form)
    
    return eloqua_forms

def main():
    """Main function to extract data"""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        html_content = data['html']
        base_url = data['url']
        
        # Extract page properties
        page_properties = extract_page_properties(html_content, base_url)
        
        # Extract Eloqua forms
        eloqua_forms = extract_eloqua_forms(html_content, base_url)
        
        # Return results
        result = {
            'page_properties': page_properties,
            'eloqua_forms': eloqua_forms
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'page_properties': {
                'w_page_type': 'Error',
                'w_published_date': 'Not Available',
                'w_business_unit': 'Not Available',
                'w_sector': 'Not Available',
                'w_discipline': 'Not Available',
                'w_thumbnail_image': 'Not Available',
                'w_read_time': 'Not Available'
            },
            'eloqua_forms': []
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()