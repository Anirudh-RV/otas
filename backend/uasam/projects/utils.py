# Please use this file for additional logic

class ProjectUtils:
    @staticmethod
    def validate_create_project_payload(payload: dict):
        """
        Inline validator for create project request payload.
        Returns (is_valid: bool, data_or_errors: dict)
        """
        errors = []
        if not isinstance(payload, dict):
            return False, {"errors": ["invalid_json"]}

        # project_name
        name = payload.get("project_name")
        if name is None:
            errors.append("project_name is required")
        else:
            if not isinstance(name, str):
                errors.append("project_name must be a string")
            else:
                name = name.strip()
                if not name:
                    errors.append("project_name is required")
                elif len(name) > 255:
                    errors.append("project_name too long (max 255)")

        # project_description (optional)
        desc = payload.get("project_description", "")
        if desc is None:
            desc = ""
        if not isinstance(desc, str):
            errors.append("project_description must be a string")
        elif len(desc) > 300:
            errors.append("project_description max 300 characters")

        if errors:
            return False, {"errors": errors}
        
        domain = payload.get("project_domain", "")

        return True, {"project_name": name, "project_description": desc, "project_domain": domain}