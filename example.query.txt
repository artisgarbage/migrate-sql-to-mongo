SELECT
        employee_id         as employee_id,
        samaccountname      as samaccountname,
        givenname           as givenname,
        surname             as surname,
        displayname         as displayname,
        job_title           as job_title,
        department_name     as department_name,
        office_phone        as office_phone,
        mobile_phone        as mobile_phone,
        office_email        as office_email,
        office_description  as office_description,
        cur_desk_location   as desk_location,
        ea_coordinator      as ea_coordinator
FROM  [employeefile].[dbo].employees e
        JOIN [employeefile].[dbo].departments d
            ON (e.department_id = d.department_id)
        JOIN [employeefile].[dbo].office_locations ol
            ON (e.office_location_id = ol.office_location_id )
WHERE e.active = 'Y'
