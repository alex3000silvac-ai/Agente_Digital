
import re
content = open("CuadernoAnalista.vue", "r").read()
template_start = content.find("<template>")
template_end = content.find("</template>") + 11
template_content = content[template_start:template_end]

# Count specific tags
for tag in ["div", "main", "aside", "header"]:
    opens = template_content.count(f"<{tag}")
    closes = template_content.count(f"</{tag}>")
    if opens \!= closes:
        print(f"{tag}: opens={opens}, closes={closes}, diff={opens-closes}")

