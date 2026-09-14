import re

with open('src/RootApp.jsx', 'r') as f:
    text = f.read()

# Replace ErpWrapper fallback
text = text.replace('<Suspense fallback={<Preloader />}>', '<Suspense fallback={<ErpSkeleton />}>', 1)
# Replace App fallback
text = text.replace('<Suspense fallback={<Preloader />}>', '<Suspense fallback={<RouteSkeleton />}>', 1)

# Add imports
imports = """import Preloader from './Website/components/UI/Preloader/Preloader';
import RouteSkeleton from './Website/components/UI/RouteSkeleton';
import ErpSkeleton from './ERP/components/shared/ErpSkeleton';"""
text = text.replace("import Preloader from './Website/components/UI/Preloader/Preloader';", imports)

with open('src/RootApp.jsx', 'w') as f:
    f.write(text)

print("RootApp updated")
