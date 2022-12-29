from bokeh.plotting import figure, output_file, show

# 데이터 준비
x = [1, 2, 3, 4, 5]
y = [6, 7, 2, 4, 5]

# HTML 파일을 따로 생성
# output_notebook() - notebook 에서 바로 확인할 때
output_file("lines.html")

# figure 만들기
p = figure(title="simple line example", x_axis_label='x', y_axis_label='y')

# figure 에 그릴 그래프 그리기
p.line(x, y, line_width=2)

# 새 브라우저 탭에 출력!
show(p)