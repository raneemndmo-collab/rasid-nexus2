#!/bin/bash
# Fix all Phase 1 files to use camelCase matching Phase 0 patterns
# This script uses sed to do bulk replacements

cd /home/ubuntu/rasid-nexus2/src/modules

# Fix all Phase 1 ORM entities: add ! assertion to properties
for f in k6-notification/infrastructure/persistence/repositories/notification.orm-entity.ts \
         k7-scheduler/infrastructure/persistence/repositories/scheduler.orm-entity.ts \
         m5-departments/infrastructure/persistence/repositories/department.orm-entity.ts \
         m6-employees/infrastructure/persistence/repositories/employee.orm-entity.ts \
         m7-attendance/infrastructure/persistence/repositories/attendance.orm-entity.ts \
         m8-leave/infrastructure/persistence/repositories/leave.orm-entity.ts; do
  if [ -f "$f" ]; then
    # Replace property declarations without ! to add !
    # Pattern: "  property_name: type" -> "  property_name!: type" (only for non-optional)
    sed -i 's/^\(  [a-z_]*\): \(string\|number\|boolean\|Date\|Record\)/\1!: \2/g' "$f"
    # Fix tenant_id -> tenantId with column name mapping
    sed -i "s/tenant_id!: string/tenantId!: string/g" "$f"
    sed -i "s/@Column()\n  @Index()\n  tenant_id/@Column({ name: 'tenant_id' })\n  @Index()\n  tenantId/g" "$f"
    echo "Fixed: $f"
  fi
done

echo "Done. Manual review needed."
