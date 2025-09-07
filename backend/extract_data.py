#!/usr/bin/env python3
"""
Enhanced Python extraction for w-* meta attributes and Eloqua forms
Uses BeautifulSoup4 and lxml for accurate HTML parsing
"""

import sys
import json
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def extract_w_meta_attributes(soup, base_url):
    """Extract w-* meta attributes using BeautifulSoup"""
    print("🔍 Extracting w-* meta attributes with Python...", file=sys.stderr)
    
    attributes = {}
    
    # w-page-type extraction
    page_type = "Not Available"
    page_type_element = soup.find('meta', attrs={'name': 'w-page-type'})
    if page_type_element and page_type_element.get('content'):
        page_type = page_type_element.get('content')
        print(f"✅ Found w-page-type: {page_type}", file=sys.stderr)
    
    attributes['w-page-type'] = page_type
    
    # w-published-date extraction
    published_date = "Not Available"
    published_date_element = soup.find('meta', attrs={'name': 'w-published-date'})
    if published_date_element and published_date_element.get('content'):
        published_date = published_date_element.get('content')
        print(f"✅ Found w-published-date: {published_date}", file=sys.stderr)
    
    attributes['w-published-date'] = published_date
    
    # w-business-unit extraction
    business_unit = "Not Available"
    business_unit_element = soup.find('meta', attrs={'name': 'w-business-unit'})
    if business_unit_element and business_unit_element.get('content'):
        business_unit = business_unit_element.get('content')
        print(f"✅ Found w-business-unit: {business_unit}", file=sys.stderr)
    
    attributes['w-business-unit'] = business_unit
    
    # w-sector extraction
    sector = "Not Available"
    sector_element = soup.find('meta', attrs={'name': 'w-sector'})
    if sector_element and sector_element.get('content'):
        sector = sector_element.get('content')
        print(f"✅ Found w-sector: {sector}", file=sys.stderr)
    
    attributes['w-sector'] = sector
    
    # w-discipline extraction
    discipline = "Not Available"
    discipline_element = soup.find('meta', attrs={'name': 'w-discipline'})
    if discipline_element and discipline_element.get('content'):
        discipline = discipline_element.get('content')
        print(f"✅ Found w-discipline: {discipline}", file=sys.stderr)
    
    attributes['w-discipline'] = discipline
    
    # w-read-time extraction
    read_time = "Not Available"
    read_time_element = soup.find('meta', attrs={'name': 'w-read-time'})
    if read_time_element and read_time_element.get('content'):
        read_time = read_time_element.get('content')
        print(f"✅ Found w-read-time: {read_time}", file=sys.stderr)
    
    attributes['w-read-time'] = read_time
    
    # w-thumbnail-image extraction
    thumbnail_image = "Not Available"
    thumbnail_element = soup.find('meta', attrs={'name': 'w-thumbnail-image'})
    if thumbnail_element and thumbnail_element.get('content'):
        thumbnail_image = thumbnail_element.get('content')
        # Convert relative URLs to absolute
        if thumbnail_image and not thumbnail_image.startswith('http'):
            thumbnail_image = urljoin(base_url, thumbnail_image)
        print(f"✅ Found w-thumbnail-image: {thumbnail_image}", file=sys.stderr)
    
    attributes['w-thumbnail-image'] = thumbnail_image
    
    # Extract additional w-* attributes found in the page source
    # w-search-type
    search_type = "Not Available"
    search_type_element = soup.find('meta', attrs={'name': 'w-search-type'})
    if search_type_element and search_type_element.get('content'):
        search_type = search_type_element.get('content')
        print(f"✅ Found w-search-type: {search_type}", file=sys.stderr)
    
    attributes['w-search-type'] = search_type
    
    # w-language
    language = "Not Available"
    language_element = soup.find('meta', attrs={'name': 'w-language'})
    if language_element and language_element.get('content'):
        language = language_element.get('content')
        print(f"✅ Found w-language: {language}", file=sys.stderr)
    
    attributes['w-language'] = language
    
    # w-page-type-id
    page_type_id = "Not Available"
    page_type_id_element = soup.find('meta', attrs={'name': 'w-page-type-id'})
    if page_type_id_element and page_type_id_element.get('content'):
        page_type_id = page_type_id_element.get('content')
        print(f"✅ Found w-page-type-id: {page_type_id}", file=sys.stderr)
    
    attributes['w-page-type-id'] = page_type_id
    
    # w-business-unit-id
    business_unit_id = "Not Available"
    business_unit_id_element = soup.find('meta', attrs={'name': 'w-business-unit-id'})
    if business_unit_id_element and business_unit_id_element.get('content'):
        business_unit_id = business_unit_id_element.get('content')
        print(f"✅ Found w-business-unit-id: {business_unit_id}", file=sys.stderr)
    
    attributes['w-business-unit-id'] = business_unit_id
    
    # w-sector-id
    sector_id = "Not Available"
    sector_id_element = soup.find('meta', attrs={'name': 'w-sector-id'})
    if sector_id_element and sector_id_element.get('content'):
        sector_id = sector_id_element.get('content')
        print(f"✅ Found w-sector-id: {sector_id}", file=sys.stderr)
    
    attributes['w-sector-id'] = sector_id
    
    print(f"✅ W-* meta attributes extracted: {attributes}", file=sys.stderr)
    return attributes

def extract_eloqua_forms(soup, base_url):
    """Extract Eloqua forms using BeautifulSoup with comprehensive detection"""
    print("🔍 Extracting Eloqua forms with Python...", file=sys.stderr)
    
    eloqua_forms = []
    form_index = 0
    
    # Method 1: Find forms with Eloqua attributes
    eloqua_attribute_patterns = [
        'data-form-name',
        'data-elq-id', 
        'elq-form-id',
        'eloqua-id',
        'elq-id'
    ]
    
    all_forms = soup.find_all('form')
    print(f"🔍 Found {len(all_forms)} total forms", file=sys.stderr)
    
    for form in all_forms:
        has_eloqua = False
        
        # Check for Eloqua attributes
        for attr in eloqua_attribute_patterns:
            if form.get(attr):
                has_eloqua = True
                print(f"✅ Found form with {attr}: {form.get(attr)}", file=sys.stderr)
                break
        
        # Check for Eloqua in class names
        form_classes = form.get('class', [])
        if isinstance(form_classes, str):
            form_classes = form_classes.split()
        
        if any('eloqua' in cls.lower() or 'elq' in cls.lower() for cls in form_classes):
            has_eloqua = True
            print(f"✅ Found form with Eloqua class: {form_classes}", file=sys.stderr)
        
        if has_eloqua:
            form_index += 1
            
            # Extract all Eloqua attributes
            data_form_name = (
                form.get('data-form-name') or
                form.get('elq-form-name') or
                form.get('eloqua-form-name') or
                form.get('name') or
                f"Eloqua Form {form_index}"
            )
            
            data_elq_id = (
                form.get('data-elq-id') or
                form.get('elq-form-id') or
                form.get('eloqua-id') or
                form.get('elq-id') or
                f"elq-{form_index}"
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
                f"eloqua-form-{form_index}"
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
            print(f"🔍 Found {len(hidden_inputs)} hidden fields in form {form_index}", file=sys.stderr)
            
            for hidden_input in hidden_inputs:
                field_name = hidden_input.get('name', '')
                field_value = hidden_input.get('value', '')
                
                if field_name:
                    hidden_fields.append({
                        'name': field_name,
                        'value': field_value,
                        'element': str(hidden_input)
                    })
                    print(f"  📝 Hidden field: {field_name} = {field_value}", file=sys.stderr)
            
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
            print(f"✅ Added Eloqua form {form_index}: {data_form_name}", file=sys.stderr)
    
    # Method 2: Find elements with Eloqua data attributes (not just forms)
    eloqua_elements = []
    for attr in eloqua_attribute_patterns:
        elements = soup.find_all(attrs={attr: True})
        eloqua_elements.extend(elements)
    
    print(f"🔍 Found {len(eloqua_elements)} elements with Eloqua attributes", file=sys.stderr)
    
    for element in eloqua_elements:
        # Skip if we already processed this as a form
        if element.name == 'form':
            continue
            
        form_index += 1
        
        data_form_name = (
            element.get('data-form-name') or
            element.get('elq-form-name') or
            element.get('eloqua-form-name') or
            f"Eloqua Element {form_index}"
        )
        
        data_elq_id = (
            element.get('data-elq-id') or
            element.get('elq-form-id') or
            element.get('eloqua-id') or
            element.get('elq-id') or
            f"elq-element-{form_index}"
        )
        
        eloqua_form = {
            'form_index': form_index,
            'data_form_name': data_form_name,
            'data_elq_id': data_elq_id,
            'data_redirect_page': "Not Available",
            'data_analytics_name': "Element Tracking",
            'data_endpoint': "Not Available",
            'form_html': str(element)[:500] + '...' if len(str(element)) > 500 else str(element),
            'hidden_fields': []
        }
        
        eloqua_forms.append(eloqua_form)
        print(f"✅ Added Eloqua element {form_index}: {data_form_name}", file=sys.stderr)
    
    # Method 3: Search JavaScript for Eloqua configurations
    script_tags = soup.find_all('script')
    print(f"🔍 Searching {len(script_tags)} script tags for Eloqua configs", file=sys.stderr)
    
    for script in script_tags:
        script_content = script.get_text()
        if 'eloqua' in script_content.lower() or 'elq' in script_content.lower():
            form_index += 1
            
            # Extract configuration from JavaScript using regex
            form_name_patterns = [
                r'(?:elqFormName|eloquaFormName|formName)["\']?\s*:\s*["\']([^"\']+)["\']',
                r'["\']formName["\']\s*:\s*["\']([^"\']+)["\']',
                r'["\']name["\']\s*:\s*["\']([^"\']+)["\']'
            ]
            
            elq_id_patterns = [
                r'(?:elq-?id|eloqua-?id|elqId)["\']?\s*:\s*["\']([^"\']+)["\']',
                r'["\']elqId["\']\s*:\s*["\']([^"\']+)["\']',
                r'["\']id["\']\s*:\s*["\']([^"\']+)["\']'
            ]
            
            form_name = "JavaScript Configuration"
            for pattern in form_name_patterns:
                match = re.search(pattern, script_content, re.IGNORECASE)
                if match:
                    form_name = match.group(1)
                    break
            
            elq_id = "JavaScript Based"
            for pattern in elq_id_patterns:
                match = re.search(pattern, script_content, re.IGNORECASE)
                if match:
                    elq_id = match.group(1)
                    break
            
            eloqua_form = {
                'form_index': form_index,
                'data_form_name': form_name,
                'data_elq_id': elq_id,
                'data_redirect_page': "Not Available",
                'data_analytics_name': "JavaScript Tracking",
                'data_endpoint': "Not Available",
                'form_html': script_content[:500] + '...' if len(script_content) > 500 else script_content,
                'hidden_fields': []
            }
            
            eloqua_forms.append(eloqua_form)
            print(f"✅ Added JavaScript Eloqua config {form_index}: {form_name}", file=sys.stderr)
    
    print(f"✅ Total Eloqua forms extracted: {len(eloqua_forms)}", file=sys.stderr)
    return eloqua_forms

def main():
    """Main extraction function"""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        html_content = data['html']
        base_url = data['url']
        
        print(f"🚀 Starting Python extraction for: {base_url}", file=sys.stderr)
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(html_content, 'lxml')
        print("✅ HTML parsed with BeautifulSoup + lxml", file=sys.stderr)
        
        # Extract w-* meta attributes
        w_meta_attributes = extract_w_meta_attributes(soup, base_url)
        
        # Extract Eloqua forms
        eloqua_forms = extract_eloqua_forms(soup, base_url)
        
        # Return results
        result = {
            'success': True,
            'w_meta_attributes': w_meta_attributes,
            'eloqua_forms': eloqua_forms
        }
        
        print(f"✅ Python extraction completed successfully", file=sys.stderr)
        print(f"📊 Results: {len(eloqua_forms)} Eloqua forms, {len(w_meta_attributes)} w-* attributes", file=sys.stderr)
        
        print(json.dumps(result))
        
    except Exception as e:
        print(f"❌ Python extraction error: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        
        error_result = {
            'success': False,
            'error': str(e),
            'w_meta_attributes': {
                'w-page-type': 'Not Available',
                'w-published-date': 'Not Available',
                'w-business-unit': 'Not Available',
                'w-sector': 'Not Available',
                'w-discipline': 'Not Available',
                'w-read-time': 'Not Available',
                'w-thumbnail-image': 'Not Available',
                'w-search-type': 'Not Available',
                'w-language': 'Not Available',
                'w-page-type-id': 'Not Available',
                'w-business-unit-id': 'Not Available',
                'w-sector-id': 'Not Available'
            },
            'eloqua_forms': []
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()