-- Update process_records with meaningful titles
UPDATE process_records SET record_title = 'Calibration Failure on Lab Equipment A-204' WHERE record_title = 'ezrz';
UPDATE process_records SET record_title = 'Temperature Excursion - Cold Storage Unit 3' WHERE record_title = 'zrzer';
UPDATE process_records SET record_title = 'Supplier ABC - Annual Qualification Review' WHERE record_title = 'eezrz';
UPDATE process_records SET record_title = 'Packaging Defect Investigation - Batch 2024-887' WHERE record_title = 'sdfdfsd';
UPDATE process_records SET record_title = 'Temperature Deviation in Cooler Unit C-12' WHERE record_title = 'deviation in cooler';
UPDATE process_records SET record_title = 'Cold Chain Breach During Transit - Shipment SH-4521' WHERE record_title = 'one more dev';
UPDATE process_records SET record_title = 'CAPA for Recurring Labeling Errors' WHERE record_title = 'linked CAPA';
UPDATE process_records SET record_title = 'Foreign Particle Contamination - Production Line 7' WHERE record_title = 'sdfsd';
UPDATE process_records SET record_title = 'Raw Material Specification Deviation - Lot RM-2024-112' WHERE record_title = 'sdfdsf';
UPDATE process_records SET record_title = 'Equipment Malfunction - Filling Station 2' WHERE record_title = 'azeaze';
UPDATE process_records SET record_title = 'Document Control Gap - SOP Rev. 12' WHERE record_title = 'aze';
UPDATE process_records SET record_title = 'Sterility Test Failure Investigation' WHERE record_title = 'eza';
UPDATE process_records SET record_title = 'Batch Release Delay - Pending QA Review' WHERE record_title = 'zae';
UPDATE process_records SET record_title = 'Customer Complaint - Product Discoloration' WHERE record_title = 'zaezae';
UPDATE process_records SET record_title = 'Validation Protocol Deviation - Process Line A' WHERE record_title = 'zaeza';
UPDATE process_records SET record_title = 'Environmental Monitoring Excursion - Clean Room 4' WHERE record_title = 'zaeaz';

-- Update field values - find and update gibberish descriptions with meaningful content
UPDATE record_field_values SET field_value = 'During routine calibration check, Lab Equipment A-204 showed readings outside acceptable tolerance range (±0.5%). Equipment was immediately taken offline and tagged out of service.' 
WHERE field_value IN ('sdfsd', 'sdfsdf', 'ezrz', 'zrzer', 'eezrz', 'azeaze', 'aze', 'eza', 'zae', 'zaezae', 'zaeza', 'zaeaz', 'azeaz', 'zaeaze')
AND field_id IN (SELECT id FROM process_fields WHERE field_name ILIKE '%description%' OR field_label ILIKE '%description%');

UPDATE record_field_values SET field_value = 'Investigation revealed worn calibration reference standard and environmental temperature fluctuation in calibration room. Contributing factor: delayed preventive maintenance schedule.'
WHERE field_value IN ('sdfsd', 'sdfsdf', 'ezrz', 'zrzer', 'eezrz', 'azeaze', 'aze', 'eza', 'zae', 'zaezae', 'zaeza', 'zaeaz', 'azeaz', 'zaeaze')
AND field_id IN (SELECT id FROM process_fields WHERE field_name ILIKE '%root%cause%' OR field_label ILIKE '%root%cause%');

UPDATE record_field_values SET field_value = '1. Replace calibration reference standards immediately. 2. Install environmental monitoring in calibration room. 3. Update PM schedule to quarterly calibration checks. 4. Retrain technicians on calibration procedures.'
WHERE field_value IN ('sdfsd', 'sdfsdf', 'ezrz', 'zrzer', 'eezrz', 'azeaze', 'aze', 'eza', 'zae', 'zaezae', 'zaeza', 'zaeaz', 'azeaz', 'zaeaze')
AND field_id IN (SELECT id FROM process_fields WHERE field_name ILIKE '%corrective%' OR field_label ILIKE '%corrective%' OR field_name ILIKE '%action%' OR field_label ILIKE '%action%');

-- Update any remaining single-word gibberish values with contextual content
UPDATE record_field_values SET field_value = 'Quality Control' 
WHERE field_value IN ('sdfsd', 'sdfsdf', 'ezrz', 'zrzer', 'eezrz', 'azeaze', 'aze', 'eza', 'zae', 'zaezae', 'zaeza', 'zaeaz')
AND field_id IN (SELECT id FROM process_fields WHERE field_name ILIKE '%department%' OR field_label ILIKE '%department%');

UPDATE record_field_values SET field_value = 'John Smith - QA Manager'
WHERE field_value IN ('sdfsd', 'sdfsdf', 'ezrz', 'zrzer', 'eezrz', 'azeaze', 'aze', 'eza', 'zae', 'zaezae', 'zaeza', 'zaeaz')
AND field_id IN (SELECT id FROM process_fields WHERE field_name ILIKE '%reporter%' OR field_label ILIKE '%reporter%' OR field_name ILIKE '%initiator%');

UPDATE record_field_values SET field_value = 'Medium'
WHERE field_value IN ('sdfsd', 'sdfsdf', 'ezrz', 'zrzer', 'eezrz', 'azeaze', 'aze', 'eza', 'zae', 'zaezae', 'zaeza', 'zaeaz')
AND field_id IN (SELECT id FROM process_fields WHERE field_name ILIKE '%severity%' OR field_label ILIKE '%severity%' OR field_name ILIKE '%priority%');

UPDATE record_field_values SET field_value = 'Production Area B - Building 2'
WHERE field_value IN ('sdfsd', 'sdfsdf', 'ezrz', 'zrzer', 'eezrz', 'azeaze', 'aze', 'eza', 'zae', 'zaezae', 'zaeza', 'zaeaz')
AND field_id IN (SELECT id FROM process_fields WHERE field_name ILIKE '%location%' OR field_label ILIKE '%location%' OR field_name ILIKE '%area%');